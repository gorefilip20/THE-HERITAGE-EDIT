import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function usdToNgnCents(usdStr: string): number {
  const usd = parseFloat(usdStr.replace(/[$,]/g, ""));
  return Math.round(usd * 1600 * 100);
}

interface CatalogProduct {
  sku: string;
  name: string;
  desc: string;
  price: string;
  hours: string;
  culture: string;
  badge: string;
  tags: string[];
  mat: string;
  sizes: string[];
  tex: string;
}

interface CatalogCategory {
  cat: string;
  catNum: string;
  catTitle: string;
  catSub: string;
  products: CatalogProduct[];
}

const CATALOG: CatalogCategory[] = [
  {
    cat: "agbada", catNum: "01", catTitle: "The Agbada Collection", catSub: "Grand ceremonial robes — voluminous, embroidered, commanding.",
    products: [
      { sku: "HE-AGB-001", name: "The Ọba Grand Agbada", desc: "Royal ceremonial agbada. 120-hour hand-embroidered chest panel in goldwork thread. Three-piece set with aso-oke base cloth.", price: "$1,480", hours: "120 hrs", culture: "YORUBA", badge: "HERO", tags: ["HAND-EMBROIDERED", "ASO-OKE", "GOLDWORK"], mat: "Aso-oke cotton-silk · Gold thread · Brass HE hardware", sizes: ["S", "M", "L", "XL"], tex: "gold-weave" },
      { sku: "HE-AGB-002", name: "The Titled Chief Agbada", desc: "Guinea brocade with tone-on-tone raised embroidery tracing ancestral clan marks.", price: "$1,150", hours: "80 hrs", culture: "YORUBA", badge: "", tags: ["GUINEA BROCADE", "CLAN MARKS"], mat: "Swiss Guinea brocade · Bone buttons with HE emboss", sizes: ["S", "M", "L", "XL"], tex: "brocade" },
      { sku: "HE-AGB-003", name: "The Midnight Diplomat", desc: "Italian wool-silk for the international stage. Matte tonal chest crest. Blackened brass cufflinks included.", price: "$1,280", hours: "60 hrs", culture: "YORUBA", badge: "", tags: ["WOOL-SILK", "DIPLOMATIC"], mat: "Italian wool-silk 70/30 · Blackened brass cufflinks", sizes: ["S", "M", "L", "XL"], tex: "dark-silk" },
      { sku: "HE-AGB-004", name: "The Elder's Wisdom", desc: "Lighter cotton grand robe with Sankofa symbol reinterpreted in Yoruba geometric vocabulary.", price: "$980", hours: "45 hrs", culture: "YORUBA", badge: "", tags: ["EGYPTIAN COTTON", "ADINKRA"], mat: "Egyptian cotton 300 GSM · Cotton thread", sizes: ["S", "M", "L", "XL", "3XL"], tex: "cotton" },
      { sku: "HE-AGB-005", name: "The Coronation Agbada", desc: "Full bespoke commission. 12 motif families. Numbered, signed by master embroiderer. Leather provenance folio.", price: "$1,850", hours: "150+ hrs", culture: "YORUBA", badge: "BESPOKE", tags: ["1 OF 1", "LEATHER FOLIO"], mat: "Hand-woven aso-oke · Custom metal HE plate", sizes: ["MTM"], tex: "gold-weave" },
      { sku: "HE-AGB-006", name: "The Indigo Reserve", desc: "Kano pit-dyed indigo with Nok terracotta-inspired high-contrast embroidery. Sterling silver hardware.", price: "$1,350", hours: "90 hrs", culture: "YORUBA", badge: "", tags: ["KANO INDIGO", "NOK MOTIFS"], mat: "Pit-dyed indigo cotton · Sterling silver HE hardware", sizes: ["S", "M", "L", "XL"], tex: "indigo" },
      { sku: "HE-AGB-007", name: "The Palm Wine Evening", desc: "Silk-organza over cotton. Trailing oil palm vine embroidery on wide sleeves. Ghost HE watermark.", price: "$1,100", hours: "70 hrs", culture: "YORUBA", badge: "", tags: ["SILK ORGANZA", "PALM VINE"], mat: "Silk organza · Structured cotton · Metallic ink", sizes: ["S", "M", "L", "XL"], tex: "organza" },
      { sku: "HE-AGB-008", name: "The Harvest Festival", desc: "Rich autumnal tones for outdoor celebrations. New Yam Festival inspired motifs.", price: "$890", hours: "50 hrs", culture: "YORUBA", badge: "", tags: ["HARVEST", "CELEBRATION"], mat: "Premium cotton 240 GSM · Autumn palette thread", sizes: ["S", "M", "L", "XL"], tex: "cotton-warm" },
      { sku: "HE-AGB-009", name: "The Modernist Agbada", desc: "Streamlined proportions. Uli-Yoruba single-line embroidery. Laser-etched matte black collar stay.", price: "$1,050", hours: "35 hrs", culture: "CROSS-CULTURAL", badge: "", tags: ["CONTEMPORARY", "ULI-YORUBA"], mat: "Japanese cotton-linen · Matte black collar stay", sizes: ["XS", "S", "M", "L", "XL"], tex: "linen" },
      { sku: "HE-AGB-010", name: "The Ancestor's Cloth", desc: "Museum-referenced Ife Kingdom bronze plaque motifs. Registered in HE Heritage Archive. Bronze lapel pin.", price: "$1,600", hours: "100+ hrs", culture: "YORUBA", badge: "ARCHIVE", tags: ["IFE BRONZES", "ARCHIVE"], mat: "Aso-oke · Museum-grade thread · Bronze pin", sizes: ["S", "M", "L", "XL"], tex: "gold-weave" },
    ],
  },
  {
    cat: "senator", catNum: "02", catTitle: "Senator & Kaftan", catSub: "Modern African power dressing — from boardroom to ceremony.",
    products: [
      { sku: "HE-SEN-001", name: "The Ancestral Line Senator", desc: "Italian Super 150s with scarification-line darts and magnetic HE collar closure.", price: "$900", hours: "25 hrs", culture: "CROSS-CULTURAL", badge: "BEST", tags: ["SUPER 150s", "MAGNETIC COLLAR"], mat: "Italian wool · Magnetic closure · Gunmetal clasp", sizes: ["S", "M", "L", "XL"], tex: "dark-silk" },
      { sku: "HE-SEN-002", name: "The Consul Senator", desc: "Irish linen for tropical boardrooms. Yan kura cross-stitch collar detailing from the North.", price: "$780", hours: "28 hrs", culture: "HAUSA FUSION", badge: "", tags: ["IRISH LINEN", "YAN KURA"], mat: "Irish linen 100% · Mother-of-pearl buttons", sizes: ["S", "M", "L", "XL"], tex: "linen" },
      { sku: "HE-SEN-003", name: "The New Money Senator", desc: "Slim-cut Japanese cotton-stretch. 3D-printed removable collar insert. Uli monogram on back yoke.", price: "$1,050", hours: "18 hrs", culture: "CONTEMPORARY", badge: "", tags: ["SLIM CUT", "3D PRINTED"], mat: "Japanese cotton-stretch · 3D-printed insert", sizes: ["XS", "S", "M", "L", "XL"], tex: "cotton" },
      { sku: "HE-SEN-004", name: "The Oracle Floor Kaftan", desc: "Heavy Italian silk with custom HE jacquard. Nsibidi neckline mandala. Hammered brass cuff plates.", price: "$1,240", hours: "55 hrs", culture: "IGBO MOTIFS", badge: "HERO", tags: ["ITALIAN SILK", "NSIBIDI"], mat: "Italian silk jacquard · Metallic thread · Brass", sizes: ["S", "M", "L", "XL"], tex: "silk-shimmer" },
      { sku: "HE-SEN-005", name: "The Moonrise Midi Kaftan", desc: "Cotton-silk daywear. Islamic calligraphic crescent at neckline. Concealed side-seam pockets.", price: "$820", hours: "30 hrs", culture: "HAUSA", badge: "", tags: ["COTTON-SILK", "CRESCENT"], mat: "Cotton-silk 60/40 · Silk embroidery thread", sizes: ["S", "M", "L", "XL"], tex: "cotton" },
      { sku: "HE-SEN-006", name: "The Jalabiya Luxury Robe", desc: "Cotton-cashmere with Kano city-gate archway embroidery. Brass toggle closure and rope belt.", price: "$740", hours: "35 hrs", culture: "HAUSA", badge: "", tags: ["CASHMERE", "KANO GATES"], mat: "Cotton-cashmere 85/15 · Brass toggle", sizes: ["M", "L", "XL", "XXL"], tex: "cotton-warm" },
      { sku: "HE-SEN-007", name: "The Senator Vest", desc: "Sleeveless senator collar. Hidden Niger-Benue confluence map embroidered on back panel.", price: "$480", hours: "15 hrs", culture: "CROSS-CULTURAL", badge: "", tags: ["SLEEVELESS", "CONFLUENCE MAP"], mat: "Cotton-linen blend · Antique brass buttons", sizes: ["S", "M", "L", "XL"], tex: "linen" },
      { sku: "HE-SEN-008", name: "The Court Kaftan", desc: "Benin Kingdom bronze-plaque hierarchy bands. Status-ascending embroidery from hem to collar.", price: "$950", hours: "45 hrs", culture: "BENIN", badge: "", tags: ["BENIN BRONZES", "STATUS BANDS"], mat: "Stiff silk-cotton · Bronze thread · Bone button", sizes: ["S", "M", "L", "XL"], tex: "dark-silk" },
      { sku: "HE-SEN-009", name: "The Traveller's Kaftan", desc: "Japanese technical wrinkle-resistant fabric. Precision titanium collar pin. Zero embroidery — pure form.", price: "$680", hours: "12 hrs", culture: "MINIMALIST", badge: "", tags: ["TECH FABRIC", "TITANIUM"], mat: "Japanese polyester-silk hybrid · Titanium", sizes: ["XS", "S", "M", "L", "XL"], tex: "dark-silk" },
      { sku: "HE-SEN-010", name: "The Double-Breasted Heritage", desc: "Six Adinkra-symbol bronze buttons — each a different proverb. English worsted wool.", price: "$1,100", hours: "30 hrs", culture: "PAN-AFRICAN", badge: "", tags: ["ADINKRA BUTTONS", "6 PROVERBS"], mat: "English worsted wool · 6 bronze Adinkra buttons", sizes: ["S", "M", "L", "XL"], tex: "dark-silk" },
    ],
  },
  {
    cat: "asooke", catNum: "03", catTitle: "Aso Oke & Hand-Woven", catSub: "Hand-woven on wooden looms by master weavers in Iseyin, Oyo State.",
    products: [
      { sku: "HE-ASO-001", name: "Grand Aso Oke Three-Piece", desc: "Ẹtu guinea-fowl prestige pattern. 21 days continuous weaving. Gold HE crest woven at selvedge edge.", price: "$1,480", hours: "21 days", culture: "YORUBA", badge: "SIGNATURE", tags: ["ẸTU PATTERN", "GOLD CREST"], mat: "Aso-oke cotton · Gold thread HE crest", sizes: ["S", "M", "L", "XL"], tex: "gold-weave" },
      { sku: "HE-ASO-002", name: "The Sanyan Silk Aso Oke", desc: "Rarest aso-oke — Anaphe moth silk. Only 10 units worldwide. Warm brown-cream natural lustre.", price: "$1,650", hours: "28 days", culture: "YORUBA", badge: "RARE", tags: ["WILD SILK", "MOTH SILK"], mat: "Anaphe moth silk aso-oke · Gold accent", sizes: ["S", "M", "L", "XL"], tex: "silk-shimmer" },
      { sku: "HE-ASO-003", name: "The Alaari Red Celebration", desc: "Crimson aso-oke for ceremonies and chieftaincy titles. Gold thread geometric hem embroidery.", price: "$1,200", hours: "18 days", culture: "YORUBA", badge: "CEREMONY", tags: ["ALAARI RED", "GOLD HEM"], mat: "Alaari aso-oke cotton · Gold thread", sizes: ["S", "M", "L", "XL"], tex: "crimson" },
      { sku: "HE-ASO-004", name: "The Aso Oke Bomber", desc: "500-year textile in a 20th-century form. Merino ribbing, brass HE zip pull, bilingual labels.", price: "$720", hours: "14 days", culture: "CONTEMPORARY", badge: "", tags: ["BOMBER CUT", "MERINO"], mat: "Aso-oke · Merino wool · HE silk lining", sizes: ["XS", "S", "M", "L", "XL"], tex: "indigo" },
      { sku: "HE-ASO-005", name: "Pocket Square Set (×4)", desc: "Four hand-woven patterns: Ẹtu, Alaari, Sanyan, Ọ̀jà. Zero-waste remnant cutting. Wooden display box.", price: "$280", hours: "4 hrs", culture: "YORUBA", badge: "SET", tags: ["FOUR PATTERNS", "ZERO WASTE"], mat: "Aso-oke remnants · Hand-rolled edges", sizes: ["42cm"], tex: "gold-weave" },
      { sku: "HE-ASO-006", name: "The Aso Oke Crossbody", desc: "Ọ̀jà market-stripe with Kano vegetable-tanned leather trim. Magnetic HE-monogram snap.", price: "$350", hours: "5 days", culture: "YORUBA", badge: "", tags: ["ỌJÀ STRIPE", "KANO LEATHER"], mat: "Aso-oke · Vegetable-tanned leather · Brass", sizes: ["28×22cm"], tex: "indigo" },
      { sku: "HE-ASO-007", name: "The Aso Oke Table Runner", desc: "2-meter Ẹtu pattern runner for dining. Gold HE crests woven at both ends. Hand-knotted silk fringe.", price: "$420", hours: "10 days", culture: "YORUBA", badge: "HOME", tags: ["HOME DÉCOR", "ẸTU"], mat: "Aso-oke cotton · Gold thread · Silk fringe", sizes: ["200×35"], tex: "gold-weave" },
      { sku: "HE-ASO-008", name: "The Aso Oke Laptop Sleeve", desc: "Custom HE geometric weave pattern. Foam-padded interior. Microfiber lining. Brass magnetic snap.", price: "$240", hours: "5 days", culture: "CONTEMPORARY", badge: "", tags: ["TECH", "CUSTOM WEAVE"], mat: "Custom aso-oke · Foam · Microfiber · Brass", sizes: ["13″", "15″"], tex: "indigo" },
      { sku: "HE-ASO-009", name: "Fila Collection (×3)", desc: "Three aso-oke fila caps: Ẹtu, Alaari, HE Custom Geometric. Master-folded in Ibadan.", price: "$380", hours: "Folded", culture: "YORUBA", badge: "SET", tags: ["THREE STYLES", "IBADAN"], mat: "Aso-oke · Branded cylindrical hatbox", sizes: ["M", "L", "XL"], tex: "gold-weave" },
      { sku: "HE-ASO-010", name: "The Ceremonial Shawl", desc: "2.5m Petuje interlocking-diamond shawl. Silk fringe. The owambe arrival piece thrown over one shoulder.", price: "$560", hours: "14 days", culture: "YORUBA", badge: "", tags: ["PETUJE", "SILK FRINGE"], mat: "Aso-oke · Silk fringe · Gold corner crest", sizes: ["250×120"], tex: "gold-weave" },
    ],
  },
  {
    cat: "igbo", catNum: "04", catTitle: "Igbo Heritage", catSub: "Chieftaincy, ceremony & the art of the line — Uli, Nsibidi, and the power of the East.",
    products: [
      { sku: "HE-IGB-001", name: "The Isiagu Lion Head Jacket", desc: "400 years of chieftaincy heritage. Bronze Ofo-motif buttons. Interior lined in Uli body-art printed silk.", price: "$1,000", hours: "20 hrs", culture: "IGBO", badge: "HERO", tags: ["LION HEAD", "OFO BUTTONS"], mat: "Premium jacquard · Uli silk lining · Bronze", sizes: ["M", "L", "XL", "XXL"], tex: "brocade" },
      { sku: "HE-IGB-002", name: "The George Wrapper Ensemble", desc: "Complete ceremonial set: sequin borders, coordinating blouse, head-tie, and coral-bead HE clutch.", price: "$1,140", hours: "30 hrs", culture: "IGBO", badge: "CEREMONY", tags: ["GEORGE", "CORAL CLUTCH"], mat: "George fabric · Sequins · Coral beads", sizes: ["XS", "S", "M", "L"], tex: "silk-shimmer" },
      { sku: "HE-IGB-003", name: "The Empress Column Gown", desc: "Uli embroidery unique per gown — hand-drawn before stitching. Nsibidi 'woman of power' interior panel.", price: "$1,380", hours: "65 hrs", culture: "IGBO", badge: "BESPOKE", tags: ["ULI UNIQUE", "NSIBIDI"], mat: "Silk-wool · Gold Uli embroidery", sizes: ["MTM"], tex: "dark-silk" },
      { sku: "HE-IGB-004", name: "The Priestess Wrap Gown", desc: "Heavyweight silk crepe. Nsibidi edge embroidery visible in motion. Brass Nsibidi brooch closure.", price: "$1,000", hours: "40 hrs", culture: "IGBO", badge: "", tags: ["NSIBIDI", "BRASS BROOCH"], mat: "Silk crepe · Nsibidi embroidery · Brass brooch", sizes: ["XS", "S", "M", "L"], tex: "organza" },
      { sku: "HE-IGB-005", name: "The Nsukka Atelier Blouse", desc: "Freehand Uli embroidery — no two identical. Flowing asymmetric lines across shoulder and arm.", price: "$395", hours: "20 hrs", culture: "IGBO", badge: "UNIQUE", tags: ["FREEHAND ULI", "ASYMMETRIC"], mat: "Cotton voile · Silk thread · MOP buttons", sizes: ["XS", "S", "M", "L"], tex: "cotton" },
      { sku: "HE-IGB-006", name: "The Ichi Cuff", desc: "Bronze lost-wax cuff with Ichi scarification marks. Cast by master metalworkers in Benin City.", price: "$225", hours: "8 hrs", culture: "IGBO", badge: "", tags: ["LOST-WAX", "ICHI MARKS"], mat: "Cast bronze · Hand-patinated finish", sizes: ["S", "M", "L"], tex: "bronze" },
      { sku: "HE-IGB-007", name: "The Coral Ceremony Set", desc: "Natural coral necklace + bracelet. Hand-strung on silk cord with inter-bead knotting. Brass HE toggle.", price: "$680", hours: "12 hrs", culture: "IGBO/BENIN", badge: "CEREMONY", tags: ["CORAL", "SILK CORD"], mat: "Coral beads · Silk cord · Brass toggle · Wood box", sizes: ["3 sizes"], tex: "crimson" },
      { sku: "HE-IGB-008", name: "The Ogbanje Cocktail Dress", desc: "Akwete cloth bodice meets Italian crepe skirt. Nsibidi 'crossing' symbols at the fabric junction.", price: "$850", hours: "7 days", culture: "IGBO", badge: "", tags: ["AKWETE", "DUAL FABRIC"], mat: "Akwete cloth · Italian crepe · Nsibidi thread", sizes: ["XS", "S", "M", "L"], tex: "linen" },
      { sku: "HE-IGB-009", name: "The Ofo Staff Tie Bar", desc: "Sterling silver miniature Ofo staff — Igbo symbol of truth and justice. Precision spring mechanism.", price: "$165", hours: "4 hrs", culture: "IGBO", badge: "", tags: ["STERLING", "OFO STAFF"], mat: "Sterling silver .925 · Suede box", sizes: ["6cm"], tex: "silver" },
      { sku: "HE-IGB-010", name: "The Mmanwu Masquerade Cape", desc: "Floor-length layered cape. Dense Uli shoulder yoke. Collector-registered in HE Heritage Archive.", price: "$1,550", hours: "80 hrs", culture: "IGBO", badge: "COLLECTOR", tags: ["MASQUERADE", "ARCHIVE"], mat: "Layered fabric · Uli embroidery · Silk panel", sizes: ["ONE"], tex: "dark-silk" },
    ],
  },
  {
    cat: "hausa", catNum: "05", catTitle: "Hausa & Northern Heritage", catSub: "The commanding elegance of Northern Nigerian tradition.",
    products: [
      { sku: "HE-HSA-001", name: "The Babban Riga Grand Robe", desc: "Yan kura drawn-thread openwork on chest panel. 100+ hours. Interior silk panel with Kano city-wall map.", price: "$1,320", hours: "100+ hrs", culture: "HAUSA", badge: "HERO", tags: ["YAN KURA", "KANO MAP"], mat: "Cotton damask · Silk embroidery · Matching hula", sizes: ["M", "L", "XL", "XXL"], tex: "cotton" },
      { sku: "HE-HSA-002", name: "The Emir's Reserve", desc: "Full bespoke Babban Riga. Kano pit-dyed indigo. Custom aska pattern. Leather provenance folio.", price: "$1,750", hours: "150+ hrs", culture: "HAUSA", badge: "BESPOKE", tags: ["PIT INDIGO", "1 OF 1"], mat: "Kano pit-dyed indigo · Custom embroidery", sizes: ["MTM"], tex: "indigo" },
      { sku: "HE-HSA-003", name: "The Shadda Silk Ensemble", desc: "Iridescent Shadda silk three-piece. Metallic sheen shifts with movement. Shadda-covered keepsake box.", price: "$1,100", hours: "25 hrs", culture: "HAUSA", badge: "", tags: ["SHADDA SILK", "IRIDESCENT"], mat: "Shadda silk · Metallic collar stay", sizes: ["M", "L", "XL", "XXL"], tex: "silk-shimmer" },
      { sku: "HE-HSA-004", name: "The Hausa Court Senator", desc: "Taller Northern collar. Premium Atamfa cotton. Eight-pointed Kano Emirate star embroidery.", price: "$850", hours: "40 hrs", culture: "HAUSA", badge: "", tags: ["ATAMFA", "KANO STAR"], mat: "Premium Atamfa cotton · Brass buttons", sizes: ["M", "L", "XL", "XXL"], tex: "cotton" },
      { sku: "HE-HSA-005", name: "The Zazzau Warrior Kaftan", desc: "Queen Amina inspired. Angular battle-armor embroidery. Blackened brass military-style shoulder pin.", price: "$920", hours: "40 hrs", culture: "HAUSA", badge: "", tags: ["WARRIOR", "ANGULAR"], mat: "Heavy cotton twill · Metallic thread · Brass pin", sizes: ["S", "M", "L", "XL"], tex: "dark-silk" },
      { sku: "HE-HSA-006", name: "The Durbar Festival Ensemble", desc: "Full set: robe, trousers, turban, sash. Horse-regalia embroidery. Photography booklet included.", price: "$1,450", hours: "70 hrs", culture: "HAUSA", badge: "CEREMONY", tags: ["DURBAR", "FULL SET"], mat: "Cotton damask · Silk sash · Turban", sizes: ["M", "L", "XL", "XXL"], tex: "gold-weave" },
      { sku: "HE-HSA-007", name: "The Fula Nomad Overcoat", desc: "Fulani cattle-brand marks as all-over embroidery. Horn toggle buttons. Harmattan-weight construction.", price: "$780", hours: "35 hrs", culture: "FULANI", badge: "", tags: ["CATTLE BRANDS", "HORN TOGGLES"], mat: "Cotton-wool 70/30 · Horn toggles", sizes: ["M", "L", "XL", "XXL"], tex: "cotton-warm" },
      { sku: "HE-HSA-008", name: "The Kano Indigo Tunic", desc: "Genuine Kano pit-dyed indigo. High-contrast white star neckline. Each garment naturally unique.", price: "$620", hours: "14 days", culture: "HAUSA", badge: "", tags: ["PIT INDIGO", "NATURAL"], mat: "Kano pit-dyed cotton · White thread", sizes: ["S", "M", "L", "XL"], tex: "indigo" },
      { sku: "HE-HSA-009", name: "The Hula Master Cap", desc: "Kano specialist embroidery with HE crest integrated into traditional geometric pattern vocabulary.", price: "$180", hours: "15 hrs", culture: "HAUSA", badge: "", tags: ["KANO", "INTEGRATED HE"], mat: "Cotton · Silk embroidery · Silk lining", sizes: ["M", "L", "XL"], tex: "cotton" },
      { sku: "HE-HSA-010", name: "The Turban Silk Scarf", desc: "3-meter heavy silk for turban wrapping. Hand-block-printed geometric. QR turban tutorial included.", price: "$320", hours: "Printed", culture: "HAUSA", badge: "", tags: ["TURBAN", "BLOCK PRINT"], mat: "Heavy silk momme 19 · Block print", sizes: ["300×50"], tex: "silk-shimmer" },
    ],
  },
  {
    cat: "women", catNum: "06", catTitle: "Women's Heritage", catSub: "Power, grace, and centuries of women's artistry.",
    products: [
      { sku: "HE-WMN-001", name: "The Uli Palazzo Set", desc: "Wide-leg palazzo + crop top. Full-surface freehand Uli embroidery across both pieces. Each one-of-a-kind.", price: "$880", hours: "50 hrs", culture: "IGBO", badge: "HERO", tags: ["FULL ULI", "EACH UNIQUE"], mat: "Cotton-silk · Uli embroidery · MOP buttons", sizes: ["XS", "S", "M", "L"], tex: "cotton" },
      { sku: "HE-WMN-002", name: "The Queen Amina Suit", desc: "Sharp-shouldered blazer with Zazzau fortification embroidery. Kingdom map lining. Power femininity.", price: "$1,050", hours: "35 hrs", culture: "HAUSA", badge: "", tags: ["WARRIOR QUEEN", "MAP LINING"], mat: "Wool-silk · Metallic embroidery", sizes: ["XS", "S", "M", "L"], tex: "dark-silk" },
      { sku: "HE-WMN-003", name: "The Akwete Weave Dress", desc: "Hand-woven Akwete cloth midi dress. Figurative motifs (tortoise, python, plantain). Brass HE belt buckle.", price: "$750", hours: "10 days", culture: "IGBO", badge: "", tags: ["AKWETE", "MIDI DRESS"], mat: "Akwete cloth · Leather belt · Brass buckle", sizes: ["XS", "S", "M", "L"], tex: "linen" },
      { sku: "HE-WMN-004", name: "The Adire Silk Maxi", desc: "HE innovation — Adire Eleko resist-dyeing on silk for the first time. Indigo on luminous silk.", price: "$680", hours: "7 days", culture: "YORUBA", badge: "EXCLUSIVE", tags: ["ADIRE ON SILK", "INNOVATION"], mat: "Silk · Adire Eleko dye · Silk slip", sizes: ["XS", "S", "M", "L"], tex: "indigo" },
      { sku: "HE-WMN-005", name: "The Iyalode Power Blouse", desc: "Dramatic peplum, stiff collar. Adinkra-Yoruba leadership symbol embroidery at cuffs.", price: "$420", hours: "18 hrs", culture: "YORUBA", badge: "", tags: ["PEPLUM", "LEADERSHIP"], mat: "Cotton-silk · Bone collar stays", sizes: ["XS", "S", "M", "L"], tex: "cotton" },
      { sku: "HE-WMN-006", name: "The Maiden's Coral Set", desc: "Contemporary 3-strand choker, bracelet, and drop earrings. Graduated natural coral beads.", price: "$520", hours: "8 hrs", culture: "IGBO/BENIN", badge: "", tags: ["GRADUATED CORAL", "3-PIECE"], mat: "Natural coral · Sterling silver toggle · Silk cord", sizes: ["2 lengths"], tex: "crimson" },
      { sku: "HE-WMN-007", name: "Gele Headwrap Set (×3)", desc: "Three premium geles: stiff aso-oke, soft damask, metallic mesh. QR tutorial for six tying styles.", price: "$450", hours: "Finished", culture: "YORUBA", badge: "SET", tags: ["THREE TEXTURES", "QR TUTORIAL"], mat: "Aso-oke · Damask · Metallic mesh", sizes: ["4.5m"], tex: "gold-weave" },
      { sku: "HE-WMN-008", name: "The Lace Iro & Buba", desc: "Swiss lace with Uli appliqué embroidery. Three sleeve options (bell, bishop, cape). Hidden iro pocket.", price: "$680", hours: "25 hrs", culture: "YORUBA", badge: "", tags: ["SWISS LACE", "3 SLEEVES"], mat: "Swiss lace · Uli appliqué", sizes: ["XS", "S", "M", "L"], tex: "organza" },
      { sku: "HE-WMN-009", name: "The Ankara Heritage Jumpsuit", desc: "Custom HE-exclusive Ankara print: Nsibidi-Uli fusion. Wide-leg, structured bodice, deep pockets.", price: "$580", hours: "15 hrs", culture: "PAN-AFRICAN", badge: "EXCLUSIVE", tags: ["CUSTOM ANKARA", "NSIBIDI-ULI"], mat: "Custom wax print · Self-belt · HE buckle", sizes: ["XS", "S", "M", "L"], tex: "cotton-warm" },
      { sku: "HE-WMN-010", name: "The Ancestral Silk Scarf", desc: "Three heritage traditions unified in one silk scarf: Adire + Hausa geometric + Uli line-art.", price: "$280", hours: "Printed", culture: "PAN-AFRICAN", badge: "", tags: ["THREE TRADITIONS", "TWILL SILK"], mat: "Heavy twill silk momme 16", sizes: ["180×70"], tex: "silk-shimmer" },
    ],
  },
  {
    cat: "accessories", catNum: "07", catTitle: "Accessories & Adornments", catSub: "Every detail is heritage — from leather to bronze, coral to silk.",
    products: [
      { sku: "HE-ACC-001", name: "The Archive Leather Folio", desc: "Full-grain Kano vegetable-tanned leather. Blind-embossed HE crest. Brass zip. Branded notepad included.", price: "$380", hours: "15 hrs", culture: "HAUSA", badge: "", tags: ["KANO LEATHER", "BLIND EMBOSS"], mat: "Kano leather · Brass zip · HE notepad", sizes: ["A4"], tex: "leather" },
      { sku: "HE-ACC-002", name: "The Nsibidi Signet Ring", desc: "Choose from 20 Nsibidi symbols. Hand-engraved face. Sterling silver or 18k gold vermeil.", price: "$450", hours: "Engraved", culture: "IGBO", badge: "", tags: ["NSIBIDI", "HAND ENGRAVED"], mat: "Sterling .925 or 18k gold vermeil", sizes: ["6-13"], tex: "silver" },
      { sku: "HE-ACC-003", name: "Heritage Cufflinks (Set)", desc: "Lost-wax brass. HE monogram + choice of Adire Spiral, Kano Star, or Uli Curve motif.", price: "$285", hours: "Cast", culture: "PAN-AFRICAN", badge: "", tags: ["LOST-WAX", "3 MOTIFS"], mat: "Cast brass · Leather cufflink case", sizes: ["ONE"], tex: "bronze" },
      { sku: "HE-ACC-004", name: "The Talking Drum Desk Object", desc: "Miniature ìyáàlù in iroko wood with goatskin head. Fully functional. Brass HE cord beads.", price: "$195", hours: "8 hrs", culture: "YORUBA", badge: "", tags: ["IROKO WOOD", "FUNCTIONAL"], mat: "Iroko wood · Goatskin · Brass beads", sizes: ["18×10"], tex: "leather" },
      { sku: "HE-ACC-005", name: "Heritage Fragrance — 'Ancestor'", desc: "Oud, African black soap, ylang-ylang, cedarwood, vanilla. Custom brass-cap glass vessel.", price: "$185", hours: "Blended", culture: "PAN-AFRICAN", badge: "", tags: ["OUD", "BLACK SOAP"], mat: "Glass vessel · Brass cap", sizes: ["50ml", "100ml"], tex: "bronze" },
      { sku: "HE-ACC-006", name: "Benin Bronze Card Holder", desc: "Lost-wax bronze with Benin palace wall-decoration relief border. Velvet interior.", price: "$245", hours: "Cast", culture: "BENIN", badge: "", tags: ["BENIN BRONZES", "VELVET"], mat: "Cast bronze · Velvet lining", sizes: ["10×6"], tex: "bronze" },
      { sku: "HE-ACC-007", name: "The Heritage Leather Belt", desc: "Kano leather. Three buckle designs: Classic HE, Heritage Uli, or North Kano Star.", price: "$220", hours: "Finished", culture: "PAN-AFRICAN", badge: "", tags: ["3 BUCKLES", "KANO LEATHER"], mat: "Kano leather · Brass buckle", sizes: ["30-42"], tex: "leather" },
      { sku: "HE-ACC-008", name: "The Heritage iPhone Case", desc: "Kano leather. Blind-embossed crest, Nsibidi interior, MagSafe compatible, card slot.", price: "$125", hours: "Embossed", culture: "PAN-AFRICAN", badge: "", tags: ["MAGSAFE", "NSIBIDI"], mat: "Kano leather · MagSafe array", sizes: ["15P", "16P"], tex: "leather" },
      { sku: "HE-ACC-009", name: "The Ancestral Silk Tie", desc: "Nsibidi + Uli + Hausa geometric repeat on Italian silk. Hand-rolled edges. Magnetic box.", price: "$195", hours: "Printed", culture: "PAN-AFRICAN", badge: "", tags: ["THREE TRADITIONS", "ITALIAN SILK"], mat: "Italian silk 18 momme · Magnetic box", sizes: ["STD", "SLIM"], tex: "silk-shimmer" },
      { sku: "HE-ACC-010", name: "Heritage Candle — 'Origin'", desc: "Shea butter, baobab, Lagos salt, smoked oud. Reusable ceramic vessel with debossed HE crest.", price: "$85", hours: "Poured", culture: "PAN-AFRICAN", badge: "", tags: ["SOY WAX", "60-HR BURN"], mat: "Soy wax · Ceramic vessel · Wooden lid", sizes: ["300g"], tex: "cotton-warm" },
    ],
  },
  {
    cat: "contemporary", catNum: "08", catTitle: "Contemporary Heritage", catSub: "Tradition meets tomorrow — for the generation between Lagos and London.",
    products: [
      { sku: "HE-CON-001", name: "The Heritage Bomber Jacket", desc: "British Millerain waxed cotton shell. Full Uli body-art silk lining. Nsibidi 'unity' brass zip pull.", price: "$720", hours: "15 hrs", culture: "PAN-AFRICAN", badge: "HERO", tags: ["WAXED COTTON", "ULI LINING"], mat: "Millerain waxed cotton · Silk · Leather · Brass", sizes: ["XS", "S", "M", "L", "XL"], tex: "dark-silk" },
      { sku: "HE-CON-002", name: "The Lagos-London Overcoat", desc: "Italian wool overcoat with magnetically detachable aso-oke cape collar. Two garments in one.", price: "$1,150", hours: "20 hrs", culture: "CROSS-CULTURAL", badge: "", tags: ["DETACHABLE COLLAR", "MAGNETIC"], mat: "Italian wool · Aso-oke collar · Silk lining", sizes: ["S", "M", "L", "XL"], tex: "dark-silk" },
      { sku: "HE-CON-003", name: "The Deconstructed Agbada Top", desc: "Agbada silhouette cropped to hip. Neon thread embroidery on traditional geometric. Streetwear energy.", price: "$480", hours: "25 hrs", culture: "YORUBA", badge: "", tags: ["NEON THREAD", "STREETWEAR"], mat: "Premium cotton · Neon embroidery thread", sizes: ["XS", "S", "M", "L"], tex: "cotton" },
      { sku: "HE-CON-004", name: "The Nsibidi Graphic Tee", desc: "300 GSM organic cotton. Bold Nsibidi composition. Back glossary turns wearer into a walking lesson.", price: "$145", hours: "Printed", culture: "IGBO", badge: "3 DESIGNS", tags: ["NSIBIDI", "300 GSM"], mat: "Organic cotton 300 GSM · Water-based ink", sizes: ["XS", "S", "M", "L", "XL"], tex: "cotton" },
      { sku: "HE-CON-005", name: "The Kente-Stripe Sneaker", desc: "Italian leather + hand-woven Bonwire Kente insets. No two pairs identical. Debossed HE sole.", price: "$385", hours: "Crafted", culture: "PAN-AFRICAN", badge: "UNIQUE", tags: ["KENTE", "ITALIAN LEATHER"], mat: "Italian leather · Kente cloth · Brass", sizes: ["EU 39-47"], tex: "leather" },
      { sku: "HE-CON-006", name: "The Heritage Track Set", desc: "Double-knit jersey jacket + jogger. Custom Ankara stripe panels. Brass zip pull and drawcord tips.", price: "$520", hours: "12 hrs", culture: "PAN-AFRICAN", badge: "", tags: ["ATHLEISURE", "ANKARA STRIPE"], mat: "Cotton-modal · HE Ankara print · Brass", sizes: ["XS", "S", "M", "L", "XL"], tex: "cotton" },
      { sku: "HE-CON-007", name: "The Diaspora Denim Jacket", desc: "Japanese 14oz selvedge denim. Laser-etched Nsibidi chest pattern. Adire-print cotton lining.", price: "$420", hours: "15 hrs", culture: "PAN-AFRICAN", badge: "", tags: ["SELVEDGE", "LASER NSIBIDI"], mat: "Japanese selvedge 14oz · Adire lining", sizes: ["XS", "S", "M", "L", "XL"], tex: "indigo" },
      { sku: "HE-CON-008", name: "The Heritage Swim Short", desc: "Quick-dry with micro-Nsibidi repeat. Waterproof manifesto lining. Brass drawcord tips.", price: "$195", hours: "Printed", culture: "IGBO", badge: "", tags: ["MICRO NSIBIDI", "WATERPROOF"], mat: "Quick-dry poly-elastane · Brass tips", sizes: ["XS", "S", "M", "L", "XL"], tex: "cotton" },
      { sku: "HE-CON-009", name: "The Heritage Hoodie", desc: "450 GSM organic fleece. HE monogram in Uli curved-line technique. Nsibidi 'shelter' hood interior.", price: "$295", hours: "8 hrs", culture: "IGBO", badge: "", tags: ["ULI MONOGRAM", "450 GSM"], mat: "Organic cotton fleece · Uli embroidery · Brass", sizes: ["XS", "S", "M", "L", "XL"], tex: "cotton-warm" },
      { sku: "HE-CON-010", name: "The Pan-African Weekend Bag", desc: "Kano leather body + aso-oke end panels. West Africa heritage-city map lining. Shoe compartment.", price: "$680", hours: "20 hrs", culture: "PAN-AFRICAN", badge: "", tags: ["KANO LEATHER", "ASO-OKE PANELS"], mat: "Kano leather · Aso-oke · Brass lock", sizes: ["55×35×25"], tex: "leather" },
    ],
  },
];

const CATEGORY_MAP: Record<string, string> = {
  agbada: "The Agbada Collection",
  senator: "Senator & Kaftan",
  asooke: "Aso Oke & Hand-Woven",
  igbo: "Igbo Heritage",
  hausa: "Hausa & Northern Heritage",
  women: "Women's Heritage",
  accessories: "Accessories & Adornments",
  contemporary: "Contemporary Heritage",
};

async function main() {
  console.log("🌍 Seeding 80-product Heritage Edit catalog...\n");

  const brand = await prisma.brand.upsert({
    where: { slug: "the-heritage-edit" },
    update: {},
    create: {
      name: "The Heritage Edit",
      slug: "the-heritage-edit",
      description: "Ultra-premium African luxury fashion house",
      country: "Nigeria",
    },
  });
  console.log(`✓ Brand: ${brand.name}`);

  const categoryRecords: Record<string, string> = {};
  for (const catEntry of CATALOG) {
    const cat = await prisma.category.upsert({
      where: { slug: catEntry.cat },
      update: { name: CATEGORY_MAP[catEntry.cat] },
      create: {
        name: CATEGORY_MAP[catEntry.cat],
        slug: catEntry.cat,
      },
    });
    categoryRecords[catEntry.cat] = cat.id;
  }
  console.log(`✓ ${Object.keys(categoryRecords).length} catalog categories ready`);

  const collectionRecords: Record<string, string> = {};
  for (const catEntry of CATALOG) {
    const col = await prisma.collection.upsert({
      where: { slug: catEntry.cat },
      update: { name: catEntry.catTitle, description: catEntry.catSub },
      create: {
        name: catEntry.catTitle,
        slug: catEntry.cat,
        description: catEntry.catSub,
        isFeatured: true,
      },
    });
    collectionRecords[catEntry.cat] = col.id;
  }
  console.log(`✓ ${Object.keys(collectionRecords).length} collections ready`);

  let created = 0;
  let skipped = 0;

  for (const catEntry of CATALOG) {
    for (const p of catEntry.products) {
      const productSlug = slugify(p.name);

      const existing = await prisma.product.findUnique({
        where: { sku: p.sku },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const alsoExistsBySlug = await prisma.product.findUnique({
        where: { slug: productSlug },
      });
      if (alsoExistsBySlug) {
        skipped++;
        continue;
      }

      const priceCents = usdToNgnCents(p.price);
      const isFeatured = p.badge === "HERO" || p.badge === "BEST" || p.badge === "SIGNATURE";

      const product = await prisma.product.create({
        data: {
          sku: p.sku,
          name: p.name,
          slug: productSlug,
          description: `${p.desc}\n\nMaterials: ${p.mat}\nCraft Time: ${p.hours}\nCultural Origin: ${p.culture}\nTags: ${p.tags.join(", ")}`,
          brandId: brand.id,
          categoryId: categoryRecords[catEntry.cat],
          basePriceCents: priceCents,
          currency: "NGN",
          status: "PUBLISHED",
          isFeatured,
          variants: {
            create: p.sizes.map((size) => ({
              size,
              stockCount: size === "MTM" || size === "ONE" ? 1 : Math.floor(Math.random() * 15) + 3,
            })),
          },
        },
      });

      await prisma.collectionProduct.create({
        data: {
          collectionId: collectionRecords[catEntry.cat],
          productId: product.id,
        },
      });

      if (isFeatured) {
        await prisma.heritageNarrative.create({
          data: {
            productId: product.id,
            historyAndHeritage: `${p.name} draws from the rich tradition of ${p.culture.toLowerCase()} craftsmanship. ${p.desc}`,
            whenToWear: "A statement piece for ceremonies, formal occasions, gallery openings, and milestone celebrations where cultural pride meets luxury.",
            rightOccasion: ["Cultural ceremonies", "Formal events", "Art exhibitions", "Weddings"],
            styleRecommendations: [
              "Pair with gold heritage accessories for full impact",
              `Complements other pieces from the ${catEntry.catTitle}`,
            ],
            isApproved: true,
            approvedAt: new Date(),
            aiModelUsed: "catalog-seed",
          },
        });
      }

      created++;
    }
  }

  console.log(`✓ ${created} products created, ${skipped} skipped (already exist)`);
  console.log(`\n✅ Catalog seeding complete — ${created + skipped} total products in database`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
