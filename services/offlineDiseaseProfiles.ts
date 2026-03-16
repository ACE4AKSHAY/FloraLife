import { ScanResult } from "../types";

type OfflineDiseaseProfile = Omit<ScanResult, "confidence" | "imageUrl" | "timestamp"> & {
  analysisMode: "offline";
};

const healthy = (
  cropName: string,
  diseaseName: string,
  sampleImageHint: string,
): OfflineDiseaseProfile => ({
  cropName,
  diseaseName,
  status: "Healthy",
  severity: "Low",
  description: `The offline model matched this image to a healthy ${cropName.toLowerCase()} leaf pattern with no major disease markers.`,
  recommendations: [
    "Keep watering and feeding consistent for the current season.",
    "Continue checking leaves weekly so any new spots are caught early.",
    "Use good airflow and clean tools to keep the plant healthy.",
  ],
  growthStage: "Leaf inspection",
  growthStageDescription: `This offline check is based on foliage appearance for ${cropName.toLowerCase()}.`,
  symptoms: [
    "Leaf color looks even and balanced.",
    "No strong mildew, rot, rust, or blight patches are obvious.",
    "No severe edge burn, collapse, or distortion is detected.",
  ],
  causes: [
    "Good airflow around the plant.",
    "Balanced moisture and nutrition.",
    "No strong disease signature matched by the model.",
  ],
  prevention: [
    "Avoid overwatering and wet leaves late in the day.",
    "Remove damaged leaves before symptoms spread.",
    "Keep routine plant checks in your weekly care schedule.",
  ],
  sampleImageHint,
  sampleImageTips: [
    "Use one clear leaf in bright natural light.",
    "Keep the leaf centered and fill most of the frame.",
    "Avoid hands, pots, soil, or multiple plants covering the leaf.",
  ],
  analysisMode: "offline",
});

const disease = (
  cropName: string,
  diseaseName: string,
  severity: "Moderate" | "High",
  description: string,
  symptoms: string[],
  causes: string[],
  recommendations: string[],
  prevention: string[],
  sampleImageHint: string,
): OfflineDiseaseProfile => ({
  cropName,
  diseaseName,
  status: "Diseased",
  severity,
  description,
  recommendations,
  growthStage: "Leaf diagnostic stage",
  growthStageDescription: `This offline result is driven by visible leaf symptoms on ${cropName.toLowerCase()}.`,
  symptoms,
  causes,
  prevention,
  sampleImageHint,
  sampleImageTips: [
    "Use a close leaf photo with the disease area clearly visible.",
    "Keep the affected tissue sharp and in focus.",
    "Use a plain background or a single leaf for best presentation results.",
  ],
  analysisMode: "offline",
});

const reviewNeeded = (
  diseaseName: string,
  description: string,
  sampleImageHint: string,
): OfflineDiseaseProfile => ({
  cropName: "Unknown sample",
  diseaseName,
  status: "Needs Review",
  severity: "Moderate",
  description,
  recommendations: [
    "Retake the photo with one leaf filling the frame.",
    "Use bright light and avoid blur or heavy shadows.",
    "If possible, compare with an online scan for confirmation.",
  ],
  growthStage: "Unknown",
  growthStageDescription: "The offline model could not confidently map the image to a specific plant-disease leaf pattern.",
  symptoms: [
    "The image may include too much background.",
    "The sample may not match one of the model's trained leaf classes.",
    "Blur, shadow, or multiple leaves may reduce accuracy.",
  ],
  causes: [
    "Non-leaf or mixed-scene photo.",
    "Symptoms not clearly visible.",
    "Class not well represented by the training data.",
  ],
  prevention: [
    "Use tighter framing on one leaf.",
    "Keep the camera steady and well lit.",
    "Collect a clean sample image before presenting results.",
  ],
  sampleImageHint,
  sampleImageTips: [
    "Use one centered leaf only.",
    "Keep the symptom area large in the frame.",
    "Avoid cluttered backgrounds and dark lighting.",
  ],
  analysisMode: "offline",
});

export const OFFLINE_DISEASE_PROFILES: Record<string, OfflineDiseaseProfile> = {
  "apple apple scab": disease(
    "Apple",
    "Apple Scab",
    "High",
    "The offline model sees the dark, scab-like spotting pattern commonly linked with apple scab.",
    [
      "Olive to dark circular spots on leaves.",
      "Velvety or crusted lesions on the leaf surface.",
      "Yellowing around older infected patches.",
    ],
    [
      "Fungal spores spreading in cool, wet weather.",
      "Leaves staying wet for long periods.",
      "Old infected leaves left around the tree base.",
    ],
    [
      "Remove badly infected leaves from the plant area.",
      "Improve airflow by pruning crowded growth.",
      "Avoid overhead watering during cool, damp periods.",
    ],
    [
      "Clean fallen leaves around the tree regularly.",
      "Keep canopies open so foliage dries faster.",
      "Monitor new leaves early in the season.",
    ],
    "Best demo image: a single apple leaf with round dark scab patches on a plain background.",
  ),
  "apple black rot": disease(
    "Apple",
    "Apple Black Rot",
    "High",
    "The offline model matched the brown-to-black dead tissue pattern often seen in apple black rot infections.",
    [
      "Brown lesions that darken toward black.",
      "Concentric rings or expanding dead areas.",
      "Leaf tissue drying and collapsing around the spots.",
    ],
    [
      "Fungal infection moving from old cankers or fruit mummies.",
      "Wet conditions and poor sanitation.",
      "Stress weakening plant defenses.",
    ],
    [
      "Remove infected leaves and fruit immediately.",
      "Inspect nearby twigs for cankers.",
      "Keep the tree dry and well ventilated.",
    ],
    [
      "Sanitize pruning tools after each use.",
      "Do not leave rotten fruit on the tree or ground.",
      "Prune to increase airflow through the canopy.",
    ],
    "Best demo image: an apple leaf with brown-to-black lesions and clear dead tissue edges.",
  ),
  "apple cedar apple rust": disease(
    "Apple",
    "Cedar Apple Rust",
    "Moderate",
    "The orange rust-like spotting pattern in the image matches cedar apple rust symptoms in the offline model.",
    [
      "Bright yellow or orange circular spots.",
      "Rust-colored centers becoming more obvious over time.",
      "Spots grouped across the upper leaf surface.",
    ],
    [
      "Rust fungus cycling between cedar and apple hosts.",
      "Spring moisture helping spores spread.",
      "Nearby alternate host plants increasing pressure.",
    ],
    [
      "Remove heavily infected leaves where practical.",
      "Monitor nearby cedar hosts if they are present.",
      "Keep new growth under close observation after rainy periods.",
    ],
    [
      "Reduce alternate host exposure when possible.",
      "Improve canopy airflow and light penetration.",
      "Check foliage early each spring for first spots.",
    ],
    "Best demo image: an apple leaf with vivid orange rust spots clearly visible in bright light.",
  ),
  "apple healthy": healthy(
    "Apple",
    "Healthy Apple Leaf",
    "Best demo image: a clean green apple leaf with no spotting, mildew, or yellow halo.",
  ),
  "blueberry healthy": healthy(
    "Blueberry",
    "Healthy Blueberry Leaf",
    "Best demo image: a smooth blueberry leaf with even green color and no lesions.",
  ),
  "cherry including sour powdery mildew": disease(
    "Cherry",
    "Cherry Powdery Mildew",
    "Moderate",
    "The offline model detected the white powdery coating pattern associated with cherry powdery mildew.",
    [
      "White powder-like film on the leaf surface.",
      "Soft distortion or curling of newer leaves.",
      "Dull, dusty appearance over green tissue.",
    ],
    [
      "Fungal growth in humid, still air.",
      "Crowded plant structure reducing airflow.",
      "Warm conditions supporting mildew spread.",
    ],
    [
      "Separate crowded leaves and improve airflow.",
      "Remove badly coated foliage.",
      "Avoid overhead watering late in the day.",
    ],
    [
      "Keep the canopy open and dry.",
      "Inspect new growth frequently in warm weather.",
      "Clean up infected material quickly.",
    ],
    "Best demo image: a cherry leaf with obvious white powder patches over green tissue.",
  ),
  "cherry including sour healthy": healthy(
    "Cherry",
    "Healthy Cherry Leaf",
    "Best demo image: a bright cherry leaf with smooth edges and no powdery coating.",
  ),
  "corn maize cercospora leaf spot gray leaf spot": disease(
    "Corn",
    "Corn Gray Leaf Spot",
    "High",
    "The offline model matched the long gray-tan lesion pattern seen in gray leaf spot on maize leaves.",
    [
      "Long rectangular gray lesions between veins.",
      "Tan to gray dead strips running along the leaf blade.",
      "Multiple narrow spots joining into larger blighted areas.",
    ],
    [
      "Fungal pressure building in humid field conditions.",
      "Crop residue carrying spores between seasons.",
      "Dense planting and poor airflow.",
    ],
    [
      "Flag and monitor affected leaves early.",
      "Reduce leaf wetness when possible.",
      "Separate heavily infected material from healthy samples in presentations.",
    ],
    [
      "Rotate crops and manage residue well.",
      "Improve field airflow where possible.",
      "Scout before symptoms spread to upper leaves.",
    ],
    "Best demo image: a corn leaf with long gray rectangular lesions running lengthwise.",
  ),
  "corn maize common rust ": disease(
    "Corn",
    "Corn Common Rust",
    "Moderate",
    "The raised rust pustules and scattered orange-brown lesions match corn common rust in the offline model.",
    [
      "Small orange-brown raised pustules.",
      "Rust dots scattered across the leaf blade.",
      "Leaf surface looking rough or peppered.",
    ],
    [
      "Rust spores spreading in moderate temperatures.",
      "Windborne inoculum reaching the field.",
      "Susceptible foliage exposed during wet periods.",
    ],
    [
      "Track whether pustules are increasing on new leaves.",
      "Keep affected leaves documented for comparison.",
      "Avoid confusing rust with dead blight strips or large necrotic spots.",
    ],
    [
      "Scout regularly during humid weather.",
      "Remove badly affected demo leaves after use.",
      "Store presentation samples separately to prevent confusion.",
    ],
    "Best demo image: a corn leaf with many small raised orange rust pustules.",
  ),
  "corn maize northern leaf blight": disease(
    "Corn",
    "Corn Northern Leaf Blight",
    "High",
    "The long cigar-shaped lesions are a strong match for northern leaf blight on maize.",
    [
      "Large gray-green elongated lesions.",
      "Cigar-shaped dead patches on the leaf blade.",
      "Lesions widening and drying over time.",
    ],
    [
      "Fungal spores surviving on crop residue.",
      "Leaf wetness and humid weather supporting infection.",
      "Susceptible hybrids showing symptoms faster.",
    ],
    [
      "Remove severely blighted demo leaves from healthy samples.",
      "Watch upper canopy leaves for spread.",
      "Keep plants dry and well spaced where possible.",
    ],
    [
      "Rotate crops and manage residue.",
      "Scout fields after humid weather.",
      "Use clean visual samples for presentation and comparison.",
    ],
    "Best demo image: a corn leaf with large cigar-shaped gray lesions.",
  ),
  "corn maize healthy": healthy(
    "Corn",
    "Healthy Corn Leaf",
    "Best demo image: a clean corn leaf with solid green color and no rust, blight, or striping.",
  ),
  "grape black rot": disease(
    "Grape",
    "Grape Black Rot",
    "High",
    "The leaf shows dark circular lesions consistent with grape black rot in the offline model.",
    [
      "Brown circular spots with darker edges.",
      "Tiny black fruiting dots inside lesions.",
      "Spots expanding and drying the leaf tissue.",
    ],
    [
      "Fungal inoculum surviving on old fruit or canes.",
      "Warm wet weather encouraging spread.",
      "Poor sanitation around the vine.",
    ],
    [
      "Remove infected leaves and fallen fruit nearby.",
      "Keep vines airy and well pruned.",
      "Track whether lesions appear on fresh leaves.",
    ],
    [
      "Do not leave infected fruit clusters in the canopy.",
      "Prune for faster drying after rain.",
      "Inspect vines closely during humid spells.",
    ],
    "Best demo image: a grape leaf with circular brown lesions containing tiny black specks.",
  ),
  "grape esca black measles": disease(
    "Grape",
    "Grape Esca (Black Measles)",
    "High",
    "The offline model picked up the scorched and mottled leaf pattern often linked with esca or black measles.",
    [
      "Irregular brown scorched tissue between veins.",
      "Tiger-stripe style yellow and dark patches.",
      "Leaf edges drying while some inner tissue stays colored.",
    ],
    [
      "Complex trunk disease weakening water flow.",
      "Long-term wood infection stress.",
      "Heat and drought making symptoms more visible.",
    ],
    [
      "Mark affected vines and monitor repeat symptoms.",
      "Reduce plant stress from water imbalance.",
      "Inspect wood structure if symptoms recur often.",
    ],
    [
      "Protect pruning wounds where possible.",
      "Avoid unnecessary vine stress.",
      "Separate suspicious vines for closer follow-up.",
    ],
    "Best demo image: a grape leaf with yellow-brown tiger-striping and scorched tissue.",
  ),
  "grape leaf blight isariopsis leaf spot": disease(
    "Grape",
    "Grape Leaf Blight",
    "Moderate",
    "The spot pattern and tissue browning align with grape leaf blight in the offline model.",
    [
      "Dark angular or irregular spots.",
      "Leaf tissue browning around lesion clusters.",
      "Blotchy dead areas spreading across the leaf.",
    ],
    [
      "Fungal spores spreading during humid weather.",
      "Crowded foliage staying wet too long.",
      "Old infected tissue acting as inoculum.",
    ],
    [
      "Remove heavily blighted leaves from the canopy.",
      "Increase airflow around vines.",
      "Track how quickly the spots move onto new leaves.",
    ],
    [
      "Prune and train vines for better airflow.",
      "Keep demo leaves dry and clean between uses.",
      "Sanitize around old infected material.",
    ],
    "Best demo image: a grape leaf with multiple brown blotches and clear blighted zones.",
  ),
  "grape healthy": healthy(
    "Grape",
    "Healthy Grape Leaf",
    "Best demo image: a green grape leaf with clean lobes and no blight, striping, or black lesions.",
  ),
  "orange haunglongbing citrus greening": disease(
    "Orange",
    "Citrus Greening (Huanglongbing)",
    "High",
    "The uneven mottling pattern is a strong match for citrus greening in the offline model.",
    [
      "Blotchy, uneven yellow mottling.",
      "Green and yellow patches that are not symmetrical.",
      "General nutrient-stress look with irregular patterning.",
    ],
    [
      "Bacterial infection spread by psyllid insects.",
      "Chronic vascular stress inside the plant.",
      "Symptoms often becoming stronger over time.",
    ],
    [
      "Flag the plant for close follow-up immediately.",
      "Compare multiple leaves before presenting a final conclusion.",
      "Keep healthy and suspect samples separate during demos.",
    ],
    [
      "Monitor citrus pests and leaf mottling often.",
      "Use clean tools between suspect plants.",
      "Remove badly declining material from display groups.",
    ],
    "Best demo image: an orange leaf with blotchy asymmetric yellow mottling.",
  ),
  "peach bacterial spot": disease(
    "Peach",
    "Peach Bacterial Spot",
    "Moderate",
    "The offline model sees spotting and shot-hole style damage that fits peach bacterial spot.",
    [
      "Small dark spots with yellow halos.",
      "Lesions that may tear out or dry through the leaf.",
      "Scattered spotting across the blade surface.",
    ],
    [
      "Bacterial spread during wet and windy conditions.",
      "Leaf damage helping infection enter.",
      "Warm rain splash moving bacteria across foliage.",
    ],
    [
      "Avoid overhead watering on affected plants.",
      "Remove heavily spotted leaves from display material.",
      "Monitor fresh growth for increasing spot numbers.",
    ],
    [
      "Reduce splash onto foliage where possible.",
      "Keep pruning and handling tools clean.",
      "Inspect leaves after warm rainy periods.",
    ],
    "Best demo image: a peach leaf with many small dark spots and light yellow halos.",
  ),
  "peach healthy": healthy(
    "Peach",
    "Healthy Peach Leaf",
    "Best demo image: a smooth peach leaf with uniform green color and no shot-hole spotting.",
  ),
  "pepper bell bacterial spot": disease(
    "Pepper Bell",
    "Pepper Bell Bacterial Spot",
    "High",
    "The angular dark spotting in the image closely matches pepper bell bacterial spot in the offline model.",
    [
      "Small dark angular leaf lesions.",
      "Water-soaked looking spots that dry darker.",
      "Clusters of spots creating rough patchy leaf areas.",
    ],
    [
      "Bacterial spread through water splash and handling.",
      "Warm humid conditions increasing infection pressure.",
      "Infected plant material or tools spreading the issue.",
    ],
    [
      "Keep foliage dry as much as possible.",
      "Remove badly affected leaves from the plant.",
      "Do not touch healthy plants after handling infected leaves.",
    ],
    [
      "Sanitize tools and hands between plants.",
      "Water soil, not leaves, whenever possible.",
      "Give pepper plants space for airflow.",
    ],
    "Best demo image: a pepper leaf with many small dark angular spots on a single leaf.",
  ),
  "pepper bell healthy": healthy(
    "Pepper Bell",
    "Healthy Pepper Bell Leaf",
    "Best demo image: a pepper leaf with even green tone and no dark spotting or edge burn.",
  ),
  "potato early blight": disease(
    "Potato",
    "Potato Early Blight",
    "High",
    "The offline model matched the concentric brown target-like lesions seen in potato early blight.",
    [
      "Brown lesions with ring-like zoning.",
      "Yellowing around older lesions.",
      "Dry dead patches starting on older leaves.",
    ],
    [
      "Fungal pressure in warm conditions.",
      "Leaf wetness helping spores establish.",
      "Older or stressed foliage becoming infected first.",
    ],
    [
      "Remove heavily infected lower leaves.",
      "Keep foliage dry and improve airflow.",
      "Separate early blight samples from healthy leaves in demos.",
    ],
    [
      "Clean dead foliage from around the plant.",
      "Avoid splash from soil onto leaves.",
      "Monitor lower leaves first for early symptoms.",
    ],
    "Best demo image: a potato leaf with brown concentric ring spots and yellow haloing.",
  ),
  "potato late blight": disease(
    "Potato",
    "Potato Late Blight",
    "High",
    "The dark water-soaked collapse pattern is consistent with potato late blight in the offline model.",
    [
      "Dark greasy or water-soaked lesions.",
      "Rapid browning and collapse of leaf tissue.",
      "Large irregular dead areas rather than neat round spots.",
    ],
    [
      "Aggressive blight pressure during cool wet periods.",
      "Spores spreading quickly with moisture.",
      "High humidity speeding tissue collapse.",
    ],
    [
      "Act quickly when new lesions appear.",
      "Separate infected samples from healthy foliage immediately.",
      "Keep the canopy as dry as possible.",
    ],
    [
      "Avoid overhead watering in cool damp weather.",
      "Inspect leaves frequently after rain or heavy humidity.",
      "Remove decaying infected tissue from the area.",
    ],
    "Best demo image: a potato leaf with large dark water-soaked blight patches.",
  ),
  "potato healthy": healthy(
    "Potato",
    "Healthy Potato Leaf",
    "Best demo image: a healthy potato leaf with full green leaflets and no target spots or wet blight patches.",
  ),
  "raspberry healthy": healthy(
    "Raspberry",
    "Healthy Raspberry Leaf",
    "Best demo image: a raspberry leaf with crisp green leaflets and no scorch or spotting.",
  ),
  "soybean healthy": healthy(
    "Soybean",
    "Healthy Soybean Leaf",
    "Best demo image: a soybean leaf with smooth green surface and no lesion clusters.",
  ),
  "squash powdery mildew": disease(
    "Squash",
    "Squash Powdery Mildew",
    "Moderate",
    "The white powdery film on the foliage is a strong squash powdery mildew pattern in the offline model.",
    [
      "White powder patches on leaf surfaces.",
      "Dusty coating spreading across broad leaves.",
      "Leaf yellowing beneath heavy mildew areas.",
    ],
    [
      "Fungal spread under warm days and humid nights.",
      "Large dense leaves trapping moisture.",
      "Poor airflow around vines.",
    ],
    [
      "Open up dense foliage where possible.",
      "Remove leaves that are heavily covered.",
      "Keep presentation samples dry to show symptoms clearly.",
    ],
    [
      "Increase airflow around squash vines.",
      "Check leaves often once mildew first appears.",
      "Avoid crowding and stagnant humidity.",
    ],
    "Best demo image: a squash leaf with obvious white powdery patches on top of the leaf.",
  ),
  "strawberry leaf scorch": disease(
    "Strawberry",
    "Strawberry Leaf Scorch",
    "Moderate",
    "The offline model matched the scorched margin and spotting pattern commonly seen in strawberry leaf scorch.",
    [
      "Purple to dark spots expanding across the leaf.",
      "Edges looking scorched or burned.",
      "Small lesions joining into larger dry areas.",
    ],
    [
      "Leaf disease pressure building in humid foliage.",
      "Crowded planting and poor air movement.",
      "Old infected leaves carrying spores forward.",
    ],
    [
      "Remove leaves that are mostly scorched.",
      "Improve airflow around the strawberry crown.",
      "Watch new leaves for fresh spotting.",
    ],
    [
      "Keep beds clean and not overcrowded.",
      "Avoid wet leaves lingering overnight.",
      "Discard badly infected sample leaves after demonstrations.",
    ],
    "Best demo image: a strawberry leaf with dark spots and scorched brown-red margins.",
  ),
  "strawberry healthy": healthy(
    "Strawberry",
    "Healthy Strawberry Leaf",
    "Best demo image: a bright green strawberry leaf with no scorch, rust, or dead spotting.",
  ),
  "tomato bacterial spot": disease(
    "Tomato",
    "Tomato Bacterial Spot",
    "High",
    "The small dark lesions and yellowing pattern align with tomato bacterial spot in the offline model.",
    [
      "Small dark spots scattered over the leaf.",
      "Yellowing around dense spot clusters.",
      "Leaf tissue becoming rough or torn around lesions.",
    ],
    [
      "Bacteria spreading via splash and handling.",
      "Warm humid conditions increasing infection speed.",
      "Contaminated debris or tools spreading the issue.",
    ],
    [
      "Keep tomato foliage as dry as possible.",
      "Handle suspect plants last when working in the garden.",
      "Remove heavily spotted leaves from presentation sets.",
    ],
    [
      "Do not water over the leaves late in the day.",
      "Sanitize pruners and hands between plants.",
      "Space plants so air can move freely.",
    ],
    "Best demo image: a tomato leaf with many tiny dark bacterial spots and slight yellow haloing.",
  ),
  "tomato early blight": disease(
    "Tomato",
    "Tomato Early Blight",
    "High",
    "The ringed lesion pattern is a strong offline match for tomato early blight.",
    [
      "Brown lesions with target-like rings.",
      "Yellow halo around older dead spots.",
      "Lower leaves showing progressive damage first.",
    ],
    [
      "Fungal spread in warm, wet conditions.",
      "Splash from soil or old plant debris.",
      "Plant stress making leaves more vulnerable.",
    ],
    [
      "Remove badly infected lower leaves first.",
      "Mulch or protect foliage from soil splash.",
      "Keep leaves dry and well ventilated.",
    ],
    [
      "Clean up old tomato debris after each cycle.",
      "Avoid crowding tomato plants together.",
      "Monitor lower leaves weekly for first target spots.",
    ],
    "Best demo image: a tomato leaf with brown target-ring lesions and yellow haloing.",
  ),
  "tomato late blight": disease(
    "Tomato",
    "Tomato Late Blight",
    "High",
    "The large dark blighted tissue and collapse pattern are typical of tomato late blight in the offline model.",
    [
      "Dark rapidly expanding blotches.",
      "Wet-looking dead tissue on the leaf.",
      "Large irregular lesions rather than small neat spots.",
    ],
    [
      "Cool wet conditions strongly favoring blight.",
      "Spores spreading quickly across damp foliage.",
      "High humidity keeping leaves wet too long.",
    ],
    [
      "Treat this as urgent when lesions spread fast.",
      "Separate infected leaves from healthy samples immediately.",
      "Keep the plant dry and inspect neighboring leaves closely.",
    ],
    [
      "Monitor plants after rainy, cool weather.",
      "Do not leave infected wet leaves in the canopy.",
      "Use clean samples when presenting disease comparisons.",
    ],
    "Best demo image: a tomato leaf with large dark wet blight patches and collapsed tissue.",
  ),
  "tomato leaf mold": disease(
    "Tomato",
    "Tomato Leaf Mold",
    "Moderate",
    "The offline model matched the yellow patching and mold-prone underside pattern seen in tomato leaf mold.",
    [
      "Yellow patches on upper leaf surfaces.",
      "Leaf areas that may show mold beneath.",
      "Progressive browning after the yellow patches expand.",
    ],
    [
      "High humidity in dense tomato foliage.",
      "Poor airflow in protected or crowded spaces.",
      "Leaves staying damp for long periods.",
    ],
    [
      "Increase airflow around tomato plants.",
      "Remove leaves that are heavily patched or moldy.",
      "Keep demo leaves dry so symptom pattern stays visible.",
    ],
    [
      "Water early so leaves dry faster.",
      "Thin crowded foliage when safe to do so.",
      "Avoid trapping humidity around the plant.",
    ],
    "Best demo image: a tomato leaf with yellow patching and visible moldy underside if available.",
  ),
  "tomato septoria leaf spot": disease(
    "Tomato",
    "Tomato Septoria Leaf Spot",
    "High",
    "The many small round lesions strongly fit tomato septoria leaf spot in the offline model.",
    [
      "Numerous tiny round brown or gray spots.",
      "Dark borders around many small lesions.",
      "Heavy spotting causing lower leaves to yellow and drop.",
    ],
    [
      "Fungal spread through splash and wet foliage.",
      "Crowded plants slowing leaf drying.",
      "Old infected debris carrying spores.",
    ],
    [
      "Remove the most heavily spotted lower leaves.",
      "Avoid splashing soil onto foliage.",
      "Keep airflow moving through the tomato canopy.",
    ],
    [
      "Mulch to reduce splash from soil.",
      "Do not keep infected debris near healthy plants.",
      "Scout lower leaves often once humid weather starts.",
    ],
    "Best demo image: a tomato leaf packed with many small round septoria spots.",
  ),
  "tomato spider mites two spotted spider mite": disease(
    "Tomato",
    "Tomato Two-Spotted Spider Mite Damage",
    "Moderate",
    "The stippled, bronzed foliage pattern matches spider mite feeding damage in the offline model.",
    [
      "Fine yellow speckling or stippling on the leaf.",
      "Bronzed or dusty-looking leaf surface.",
      "Possible webbing in advanced infestations.",
    ],
    [
      "Mite feeding during hot dry conditions.",
      "Rapid pest buildup on stressed plants.",
      "Lower humidity favoring mite outbreaks.",
    ],
    [
      "Inspect leaf undersides for mites or webbing.",
      "Isolate badly affected leaves from healthy display samples.",
      "Reduce plant stress from heat and drought where possible.",
    ],
    [
      "Check leaf undersides regularly during hot weather.",
      "Keep plants evenly watered.",
      "Do not mix mite-damaged leaves with disease demo leaves without labeling them clearly.",
    ],
    "Best demo image: a tomato leaf with dense yellow stippling and light bronzing, ideally with visible webbing.",
  ),
  "tomato target spot": disease(
    "Tomato",
    "Tomato Target Spot",
    "Moderate",
    "The offline model sees target-like lesions that fit tomato target spot symptoms.",
    [
      "Brown circular lesions with zoned rings.",
      "Spots larger than septoria and more defined than general blight.",
      "Leaf yellowing around expanding lesions.",
    ],
    [
      "Fungal spread in humid foliage.",
      "Warm moisture encouraging lesion expansion.",
      "Residual infected plant material helping disease persist.",
    ],
    [
      "Remove the worst affected leaves first.",
      "Improve airflow around the plant.",
      "Track whether fresh lesions appear after humid days.",
    ],
    [
      "Keep tomato leaves dry where possible.",
      "Do not leave infected debris nearby.",
      "Use clearly labeled demo leaves to distinguish from early blight.",
    ],
    "Best demo image: a tomato leaf with larger ringed target-like brown lesions.",
  ),
  "tomato tomato yellow leaf curl virus": disease(
    "Tomato",
    "Tomato Yellow Leaf Curl Virus",
    "High",
    "The curled yellow foliage pattern is a strong offline match for tomato yellow leaf curl virus.",
    [
      "Yellowing and upward leaf curl.",
      "New growth looking smaller and distorted.",
      "Overall plant top growth appearing tight or stunted.",
    ],
    [
      "Virus pressure spread by whiteflies.",
      "Young growth becoming distorted after infection.",
      "Systemic stress across new leaves instead of isolated spots.",
    ],
    [
      "Check fresh top growth for repeating curl symptoms.",
      "Keep suspect plants separated from healthy demo material.",
      "Watch closely for insect pressure on nearby plants.",
    ],
    [
      "Monitor whitefly activity often.",
      "Label virus-like symptoms clearly during presentations.",
      "Use clean samples and avoid mixing with fungal leaf spots.",
    ],
    "Best demo image: a tomato top leaf with clear upward curl and bright yellowing.",
  ),
  "tomato tomato mosaic virus": disease(
    "Tomato",
    "Tomato Mosaic Virus",
    "High",
    "The uneven green-yellow mosaic pattern matches tomato mosaic virus in the offline model.",
    [
      "Patchy light and dark green mosaic pattern.",
      "Distorted or narrowed leaf shape.",
      "General leaf irregularity rather than neat spot lesions.",
    ],
    [
      "Virus spread through contact or contaminated tools.",
      "Mechanical handling moving the pathogen.",
      "Systemic infection showing in multiple leaves.",
    ],
    [
      "Handle healthy plants separately after suspect plants.",
      "Keep samples clearly labeled as virus-like symptoms.",
      "Sanitize tools and surfaces after working with affected material.",
    ],
    [
      "Avoid touching many plants with the same gloves or tools.",
      "Use clean presentation samples.",
      "Inspect new leaves for repeat mosaic distortion.",
    ],
    "Best demo image: a tomato leaf with mottled mosaic green-yellow coloring and slight distortion.",
  ),
  "tomato healthy": healthy(
    "Tomato",
    "Healthy Tomato Leaf",
    "Best demo image: a tomato leaf with strong even green color and no ring spots, curl, or mildew.",
  ),
  background: reviewNeeded(
    "Background / Unknown Sample",
    "The offline model mostly saw background or a non-matching sample instead of a clear trained leaf class.",
    "Best demo image: one single leaf, centered, sharp, bright, and filling most of the frame.",
  ),
};

export const OFFLINE_MODEL_SAMPLE_REFERENCE = Object.entries(OFFLINE_DISEASE_PROFILES).map(
  ([label, profile]) => ({
    label,
    cropName: profile.cropName ?? "Unknown sample",
    diseaseName: profile.diseaseName,
    sampleImageHint: profile.sampleImageHint ?? "Use a clear single-leaf image.",
  }),
);

export function getOfflineDiseaseProfile(label: string): OfflineDiseaseProfile {
  return (
    OFFLINE_DISEASE_PROFILES[label] ??
    reviewNeeded(
      label,
      "The offline model returned a class that does not yet have a custom hardcoded explanation in the app.",
      "Best demo image: a single leaf photo with strong lighting and clear symptoms.",
    )
  );
}
