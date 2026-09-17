import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CatalogFacets, CatalogFilters, fetchCatalogFacets } from '../data/products';

const accent = '#FF5A00';
const priceLimit = 37000;
const label = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
type AppliedFilters = Pick<CatalogFilters, 'category' | 'brand' | 'minPrice' | 'maxPrice'>;
type Props = AppliedFilters & { query: string; onQuery: (value: string) => void; onApply: (filters: AppliedFilters) => void };
type Picker = 'category' | 'brand' | null;

export default function CatalogControls({ query, category = '', brand = '', minPrice = null, maxPrice = null, onQuery, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [picker, setPicker] = useState<Picker>(null);
  const [optionSearch, setOptionSearch] = useState('');
  const [facets, setFacets] = useState<CatalogFacets | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftBrand, setDraftBrand] = useState(brand);
  const [draftMax, setDraftMax] = useState(maxPrice);
  const priceActive = minPrice != null || maxPrice != null;
  const activeCount = Number(Boolean(category)) + Number(Boolean(brand)) + Number(priceActive);

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalogFacets(controller.signal).then(setFacets).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);

  const showFilters = () => {
    Keyboard.dismiss();
    setDraftCategory(category);
    setDraftBrand(brand);
    setDraftMax(maxPrice ?? priceLimit);
    setPicker(null);
    setOpen(true);
  };
  const clear = () => {
    setDraftCategory('');
    setDraftBrand('');
    setDraftMax(priceLimit);
  };
  const apply = () => {
    if (!facets) return;
    onApply({
      category: draftCategory,
      brand: draftBrand,
      minPrice: null, // One thumb controls the upper bound; the lower bound stays at zero.
      maxPrice: draftMax != null && draftMax < priceLimit ? Math.round(draftMax) : null,
    });
    setOpen(false);
  };

  return <View style={styles.toolbar}>
    <View style={styles.searchRow}>
      <View style={[styles.search, focused && styles.focused]}>
        <Ionicons name="search-outline" size={21} color={focused ? accent : '#7E858F'} />
        <TextInput accessibilityLabel="Search products" placeholder="Search products…" placeholderTextColor="#858B94" value={query}
          onChangeText={onQuery} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoCapitalize="none" autoCorrect={false}
          returnKeyType="search" onSubmitEditing={Keyboard.dismiss} style={styles.input} />
        {query !== '' && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onQuery('')} style={styles.iconButton}><Ionicons name="close-circle" size={20} color="#858B94" /></Pressable>}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open filters${activeCount ? `, ${activeCount} active` : ''}`} onPress={showFilters}
        style={[styles.filterButton, activeCount > 0 && styles.filterActive]}>
        <Ionicons name="options-outline" size={22} color={activeCount ? '#FFFFFF' : '#252930'} />
        {activeCount > 0 && <View style={styles.count}><Text style={styles.countText}>{activeCount}</Text></View>}
      </Pressable>
    </View>

    <Modal visible={open} transparent animationType="fade" onRequestClose={() => picker ? setPicker(null) : setOpen(false)}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss filters" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
        <View style={[styles.popup, !picker && facets && styles.filterPopup]} accessibilityViewIsModal>
          <View style={styles.popupHeader}>
            {picker ? <Pressable accessibilityRole="button" accessibilityLabel="Back to filters" onPress={() => { setPicker(null); setOptionSearch(''); }} style={styles.iconButton}><Ionicons name="chevron-back" size={24} color="#252930" /></Pressable> : <View style={styles.iconSpacer} />}
            <Text accessibilityRole="header" style={styles.popupTitle}>{picker ? label(picker) : 'Filters'}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={() => setOpen(false)} style={styles.iconButton}><Ionicons name="close" size={24} color="#252930" /></Pressable>
          </View>

          {!facets ? <View style={styles.message}>{failed ? <><Text style={styles.muted}>Couldn’t load filters.</Text><Pressable accessibilityRole="button" accessibilityLabel="Retry filters" onPress={() => { setFailed(false); setAttempt(value => value + 1); }} style={styles.viewButton}><Text style={styles.viewText}>Try again</Text></Pressable></> : <><ActivityIndicator color={accent} /><Text style={styles.muted}>Loading filters…</Text></>}</View> : picker ? (
            <OptionPicker type={picker} values={picker === 'brand' ? facets.brands : facets.categories}
              selected={picker === 'brand' ? draftBrand : draftCategory} search={optionSearch} onSearch={setOptionSearch}
              onSelect={value => { if (picker === 'brand') setDraftBrand(value); else setDraftCategory(value); setPicker(null); setOptionSearch(''); }} />
          ) : <>
            <View style={styles.filterBody}>
              <FilterRow title="Category" value={draftCategory ? label(draftCategory) : 'All categories'} onPress={() => setPicker('category')} />
              <FilterRow title="Brands" value={draftBrand || 'All brands'} onPress={() => setPicker('brand')} />
              <View style={styles.priceSection}>
                <View style={styles.priceHeading}><Text style={styles.sectionTitle}>Price range</Text><Text style={styles.priceValue}>$0 – ${Math.round(draftMax ?? priceLimit).toLocaleString('en-US')}</Text></View>
                <Text style={styles.sliderLabel}>Maximum price</Text>
                <Slider accessibilityLabel="Maximum price" minimumValue={0} maximumValue={priceLimit} step={1} value={draftMax ?? priceLimit}
                  onValueChange={setDraftMax} minimumTrackTintColor={accent} maximumTrackTintColor="#E1E4E8" thumbTintColor={accent} />
                <View style={styles.priceEnds}><Text style={styles.muted}>$0</Text><Text style={styles.muted}>$37,000</Text></View>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Clear filters" onPress={clear} style={styles.clearButton}><Text style={styles.clearText}>Clear</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="View results" onPress={apply} style={styles.viewButton}><Text style={styles.viewText}>View Results</Text></Pressable>
            </View>
          </>}
        </View>
      </View>
    </Modal>
  </View>;
}

function FilterRow({ title, value, onPress }: { title: string; value: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}, ${value}`} onPress={onPress} style={({ pressed }) => [styles.filterRow, pressed && styles.pressed]}>
    <View style={styles.rowText}><Text style={styles.sectionTitle}>{title}</Text><Text numberOfLines={1} style={styles.rowValue}>{value}</Text></View>
    <Ionicons name="chevron-forward" size={20} color="#8D939B" />
  </Pressable>;
}

function OptionPicker({ type, values, selected, search, onSearch, onSelect }: { type: Exclude<Picker, null>; values: string[]; selected: string; search: string; onSearch: (value: string) => void; onSelect: (value: string) => void }) {
  const options = useMemo(() => values.filter(value => label(value).toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => label(a).localeCompare(label(b))), [search, values]);
  return <View style={styles.pickerBody}>
    <View style={styles.optionSearch}><Ionicons name="search-outline" size={20} color="#7E858F" /><TextInput accessibilityLabel={`Search ${type === 'brand' ? 'brands' : 'categories'}`} placeholder={`Search ${type === 'brand' ? 'brands' : 'categories'}…`} value={search} onChangeText={onSearch} style={styles.optionInput} /></View>
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <OptionRow value="" text={`All ${type === 'brand' ? 'brands' : 'categories'}`} selected={selected === ''} onSelect={onSelect} />
      {options.map((value, index) => {
        const letter = label(value).charAt(0).toUpperCase();
        const showLetter = type === 'brand' && letter !== label(options[index - 1] ?? '').charAt(0).toUpperCase();
        return <View key={value}>{showLetter && <Text style={styles.letter}>{letter}</Text>}<OptionRow value={value} text={label(value)} selected={selected === value} onSelect={onSelect} /></View>;
      })}
      {!options.length && <Text style={styles.noOptions}>No matching {type === 'brand' ? 'brands' : 'categories'}.</Text>}
    </ScrollView>
  </View>;
}

function OptionRow({ value, text, selected, onSelect }: { value: string; text: string; selected: boolean; onSelect: (value: string) => void }) {
  return <Pressable accessibilityRole="radio" accessibilityLabel={text} accessibilityState={{ checked: selected }} onPress={() => onSelect(value)} style={[styles.optionRow, selected && styles.optionSelected]}>
    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{text}</Text>{selected && <Ionicons name="checkmark" size={20} color={accent} />}
  </Pressable>;
}

const styles = StyleSheet.create({
  toolbar: { paddingHorizontal: 24, paddingBottom: 18 },
  searchRow: { flexDirection: 'row', gap: 10 },
  search: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 15, paddingRight: 4, borderRadius: 16, borderWidth: 1, borderColor: '#E7E9ED', backgroundColor: '#F6F7F9' },
  focused: { borderColor: accent, backgroundColor: '#FFFFFF' },
  input: { flex: 1, minWidth: 0, fontSize: 15, color: '#252930', paddingVertical: 14 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconSpacer: { width: 44 },
  filterButton: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#E2E5E9', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  filterActive: { backgroundColor: accent, borderColor: accent },
  count: { position: 'absolute', right: -4, top: -5, minWidth: 19, height: 19, paddingHorizontal: 4, borderRadius: 10, backgroundColor: '#252930', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  countText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#18202C73', padding: 20 },
  popup: { width: '100%', maxWidth: 440, height: '72%', maxHeight: 600, minHeight: 450, borderRadius: 26, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  filterPopup: { height: 'auto', minHeight: 0 },
  popupHeader: { minHeight: 66, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderColor: '#ECEEF1' },
  popupTitle: { fontSize: 18, fontWeight: '800', color: '#252930', textTransform: 'capitalize' },
  filterBody: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 12 },
  filterRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderColor: '#ECEEF1', paddingHorizontal: 4 },
  rowText: { flex: 1, gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#252930' },
  rowValue: { fontSize: 12, color: '#858B94' },
  priceSection: { paddingHorizontal: 4, paddingTop: 22, gap: 4 },
  priceHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  priceValue: { fontSize: 13, fontWeight: '700', color: accent },
  sliderLabel: { marginTop: 5, fontSize: 10, fontWeight: '600', color: '#858B94' },
  priceEnds: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderColor: '#ECEEF1' },
  clearButton: { width: '28%', minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: '#DADDE2', alignItems: 'center', justifyContent: 'center' },
  clearText: { color: '#343A43', fontSize: 14, fontWeight: '700' },
  viewButton: { flex: 1, minHeight: 52, borderRadius: 16, backgroundColor: accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  viewText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  pickerBody: { flex: 1, paddingBottom: 12 },
  optionSearch: { minHeight: 48, margin: 16, marginBottom: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 14, backgroundColor: '#F4F5F7' },
  optionInput: { flex: 1, fontSize: 14, color: '#252930', paddingVertical: 12 },
  optionRow: { minHeight: 50, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#F0F1F3' },
  optionSelected: { backgroundColor: '#FFF3EB' },
  optionText: { flex: 1, fontSize: 14, color: '#3D434B' },
  optionTextSelected: { color: '#B94709', fontWeight: '700' },
  letter: { paddingHorizontal: 22, paddingVertical: 7, backgroundColor: '#F4F5F7', color: '#858B94', fontSize: 11, fontWeight: '800' },
  noOptions: { padding: 30, color: '#858B94', textAlign: 'center' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  muted: { color: '#858B94', fontSize: 12 },
  pressed: { opacity: 0.65 },
});
