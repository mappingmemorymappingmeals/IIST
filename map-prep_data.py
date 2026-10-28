import json, re, collections, sys
src = sys.argv[1]; out = sys.argv[2]
d = json.load(open(src))
E = d['entries']

def clean(v):
    if v is None: return ''
    if isinstance(v, (int, float)): return v
    s = str(v).strip()
    if s.lower() in ('nan', 'none', 'n/a', 'na', '-', '—'): return ''
    return s

TRIBES = [
    ('Toto', r'\btoto\b'), ('Santal', r'\bsantal'), ('Oraon', r'\boraon|kurukh'),
    ('Rajbanshi', r'rajbanshi|rajbangshi'), ('Lodha', r'\blodha'), ('Kheria Sabar', r'kheria'),
    ('Mech', r'\bmech\b'), ('Garo', r'\bgaro\b'), ('Rabha', r'\brabha'), ('Limbu', r'\blimbu'),
    ('Lepcha', r'lepcha'), ('Dukpa', r'dukpa'), ('Bhutia', r'bhutia'), ('Sherpa', r'sherpa'),
    ('Tamang', r'tamang'), ('Gorkha / Nepali', r'gorkha|nepali'), ('Munda', r'\bmunda'),
    ('Bhumij', r'bhumij'), ('Birhor', r'birhor'),
]
PVTG = {'Toto', 'Lodha', 'Birhor'}  # West Bengal PVTGs per site; Kheria Sabar handled by entry flag

def tribes_of(c):
    cl = c.lower(); t = [name for name, rx in TRIBES if re.search(rx, cl)]
    if not t:
        if 'adivasi' in cl: t = ['Adivasi (multi-tribe)']
        elif 'pan-west bengal' in cl: t = ['Pan-West Bengal']
        else: t = [c]
    return t

WB = ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri',
      'Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman',
      'Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur']
def districts_of(s):
    sl = s.lower().replace('paraganas', 'parganas').replace('coochbehar', 'cooch behar')
    ds = [w for w in WB if w.lower() in sl]
    if 'new mal' in sl and 'Jalpaiguri' not in ds: ds.append('Jalpaiguri')
    return ds

RULES = [
  (r'context|framework|concept|crisis|economy|template|documentation|restoration|survival', 'Food Systems & Memory', 'scroll'),
  (r'beer|beverage|ferment|distill|liquor|alcohol|chhang|tongba|wine', 'Ferments & Beverages', 'pot'),
  (r'pitha|flatbread|pancake|bread|cake|sweet|dumpling|confection', 'Pithas, Breads & Sweets', 'pitha'),
  (r'rice|grain|cereal|millet|porridge|khichuri|paddy|noodle', 'Grains & Rice', 'grain'),
  (r'tuber|root|yam|corm', 'Wild Tubers & Roots', 'root'),
  (r'fungi|mushroom', 'Wild Fungi', 'mushroom'),
  (r'ntfp|forest produce|forest product|honey', 'Forest Produce (NTFP)', 'ecology'),
  (r'vegetable|shoot|leafy|green|fern|flower|sag|leaf', 'Forest Greens & Flowers', 'leaf'),
  (r'fish|shellfish|crab|snail|prawn|aquatic', 'Fish & Waterfoods', 'fish'),
  (r'insect|\bant\b|larva|grub|termite', 'Insects & Rare Proteins', 'ant'),
  (r'meat|chicken|pork|hen|egg|bird|hunt|fowl|game|stew', 'Meat & Forest Protein', 'flame'),
  (r'fruit|berry', 'Wild Fruits', 'fruit'),
  (r'medicin|remedy|tonic|health', 'Food as Medicine', 'herb'),
  (r'technique|additive|alkaline|method', 'Techniques & Knowledge', 'weave'),
  (r'ritual|festive|sacred|offering|festival|feast', 'Ritual & Festive', 'altar'),
]
def group_of(cat):
    for rx, g, ic in RULES:
        if re.search(rx, cat, re.I): return g, ic
    return 'Traditional Dishes', 'bowl'

FIELDS = ['entry_id','community','pvtg_status','district','state','block_village','ecology','food_name','local_name',
  'scientific_name','category','ingredients','culinary_technology','vessel_tool','season','scarcity','cultural_memory',
  'ritual_use','notes','lost_traditions','sacred_foods','medicinal_value','cultural_significance','image_reference','geo_note']
entries = []
for e in E:
    o = {k: clean(e.get(k)) for k in FIELDS}
    o['lat'] = e.get('lat'); o['lng'] = e.get('lng')
    if o['image_reference'].lower().startswith('will be updated'): o['image_reference'] = ''
    o['tribes'] = tribes_of(o['community'])
    o['districts'] = districts_of(o['district'] + ' ' + o['block_village']) if o['district'] else []
    o['pvtg'] = 'yes' in o['pvtg_status'].lower()
    o['group'], o['icon'] = group_of(o['category'])
    if e.get('origin'):
        o['origin'] = {k: clean(v) for k, v in e['origin'].items()}
    entries.append(o)

xrefs = []
for x in d['cross_reference']:
    ids = re.findall(r'[A-Z]{1,3}-\d{3}', x.get('entries', ''))
    note = x.get('entries', '').split('—', 1)[1].strip() if '—' in x.get('entries', '') else ''
    xrefs.append({'theme': x['theme'], 'communities': x['communities'], 'ids': ids, 'note': note})

layers = [{'id': l['layer'], 'name': l['name'], 'description': l['description'], 'function': l['function']} for l in d['layer_guide']]
layers.append({'id': 'L14', 'name': 'Historical Food Origins', 'description': 'Geographic origin, deep historical narrative, adoption pathway, migration and cultural contact, chronological timeline and global parallels (L14a to L14g).', 'function': 'Where the food came from, and how it travelled.'})

json.dump({'version': '2.0', 'entries': entries, 'trails': xrefs, 'layers': layers}, open(out, 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(entries), 'entries')
print(collections.Counter(t for e in entries for t in e['tribes']))
print(collections.Counter(dd for e in entries for dd in e['districts']))
print([ (e['entry_id'], e['district']) for e in entries if not e['districts']])
print(collections.Counter(e['group'] for e in entries))
print('pvtg', sum(e['pvtg'] for e in entries), collections.Counter(e['pvtg_status'] for e in entries))
