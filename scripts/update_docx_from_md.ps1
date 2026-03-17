param(
  [Parameter(Mandatory = $true)]
  [string]$MarkdownPath,

  [Parameter(Mandatory = $true)]
  [string]$DocxPath
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Escape-XmlText {
  param([string]$Text)

  if ($null -eq $Text) {
    return ''
  }

  return $Text.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}

function New-ParagraphXml {
  param(
    [string]$Text,
    [string]$Style = ''
  )

  $escapedText = Escape-XmlText $Text
  $styleXml = ''

  if ($Style) {
    $styleXml = "<w:pPr><w:pStyle w:val=""$Style""/></w:pPr>"
  }

  if ($escapedText -eq '') {
    return "<w:p>$styleXml</w:p>"
  }

  return "<w:p>$styleXml<w:r><w:t xml:space=""preserve"">$escapedText</w:t></w:r></w:p>"
}

$markdownFullPath = (Resolve-Path $MarkdownPath).Path
$docxFullPath = (Resolve-Path $DocxPath).Path
$docxDirectory = Split-Path $docxFullPath -Parent
$extractDirectory = Join-Path $docxDirectory '.codex_docx'
$tempDocxPath = Join-Path $docxDirectory '.codex_docx_output.docx'

if (Test-Path $extractDirectory) {
  Remove-Item $extractDirectory -Recurse -Force
}

if (Test-Path $tempDocxPath) {
  Remove-Item $tempDocxPath -Force
}

[System.IO.Compression.ZipFile]::ExtractToDirectory($docxFullPath, $extractDirectory)

$documentXmlPath = Join-Path $extractDirectory 'word\document.xml'
$existingDocumentXml = Get-Content -Path $documentXmlPath -Raw

$documentPrefixMatch = [regex]::Match($existingDocumentXml, '(?s)\A.*?<w:body>')
$sectionMatch = [regex]::Match($existingDocumentXml, '(?s)<w:sectPr[\s\S]*?</w:sectPr>')

if (-not $documentPrefixMatch.Success -or -not $sectionMatch.Success) {
  throw 'Could not read the existing DOCX structure.'
}

$documentPrefix = $documentPrefixMatch.Value
$sectionXml = $sectionMatch.Value
$paragraphXml = New-Object System.Collections.Generic.List[string]

foreach ($line in Get-Content -Path $markdownFullPath) {
  if ($line -match '^# (.+)$') {
    $paragraphXml.Add((New-ParagraphXml -Text $Matches[1] -Style 'Title')) | Out-Null
    continue
  }

  if ($line -match '^## (.+)$') {
    $paragraphXml.Add((New-ParagraphXml -Text $Matches[1] -Style 'Heading1')) | Out-Null
    continue
  }

  if ($line -match '^### (.+)$') {
    $paragraphXml.Add((New-ParagraphXml -Text $Matches[1] -Style 'Heading2')) | Out-Null
    continue
  }

  if ($line -match '^#### (.+)$') {
    $paragraphXml.Add((New-ParagraphXml -Text $Matches[1] -Style 'Heading3')) | Out-Null
    continue
  }

  $paragraphXml.Add((New-ParagraphXml -Text $line)) | Out-Null
}

$updatedDocumentXml = @"
$documentPrefix
$($paragraphXml -join "`r`n")
$sectionXml
</w:body></w:document>
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($documentXmlPath, $updatedDocumentXml, $utf8NoBom)

[System.IO.Compression.ZipFile]::CreateFromDirectory($extractDirectory, $tempDocxPath)
Move-Item -Force $tempDocxPath $docxFullPath
Remove-Item $extractDirectory -Recurse -Force
