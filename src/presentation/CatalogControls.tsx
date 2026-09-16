import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CatalogFacets, CatalogFilters, fetchCatalogFacets } from '../data/products';

const accent = '#FF5A00';
const label = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
type AppliedFilters = Pick<CatalogFilters, 'category' | 'brand' | 'maxPrice'>;
type Props = AppliedFilters & { query: string; onQuery: (value: string) => void; onApply: (filters: AppliedFilters) => void };

export default function CatalogControls({ query, category = '', brand = '', maxPrice = null, onQuery, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [facets, setFacets] = useState<CatalogFacets | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftBrand, setDraftBrand] = useState(brand);
  const [draftPrice, setDraftPrice] = useState(maxPrice);
  const activeCount = Number(Boolean(category)) + Number(Boolean(brand)) + Number(maxPrice != null);

  useEffect(() => {
    const controller = new AbortController();
    fetchCatalogFacets(controller.signal).then(setFacets).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [attempt]);

  const showFilters = () => {
    Keyboard.dismiss();
    setDraftCategory(category);
    setDraftBrand(brand);
    setDraftPrice(maxPrice ?? facets?.maxPrice ?? null);
    setOpen(true);
  };
  const clear = () => { setDraftCategory(''); setDraftBrand(''); setDraftPrice(facets?.maxPrice ?? null); };
  const apply = () => {
    const price = facets && draftPrice != null && draftPrice < facets.maxPrice ? Math.round(draftPrice) : null;
    onApply({ category: draftCategory, brand: draftBrand, maxPrice: price });
    setOpen(false);
  };

  return <View style={styles.toolbar}>
    <View style={styles.searchRow}>
      <View style={[styles.search, focused && styles.focused]}>
        <Ionicons name="search-outline" size={21} color={focused ? accent : '#7E858F'} />
        <TextInput accessibilityLabel="Search products" placeholder="Search products…" placeholderTextColor="#858B94" value={query}
          onChangeText={onQuery} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoCapitalize="none" autoCorrect={false}
          returnKeyType="search" onSubmitEditing={Keyboard.dismiss} style={styles.input} />
        {query !== '' && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onQuery('')} style={styles.clearIcon}><Ionicons name="close-circle" size={20} color="#858B94" /></Pressable>}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open filters${activeCount ? `, ${activeCount} active` : ''}`} onPress={showFilters}
        style={[styles.filterButton, activeCount > 0 && styles.filterActive]}>
        <Ionicons name="options-outline" size={22} color={activeCount ? '#FFFFFF' : '#252930'} />
        {activeCount > 0 && <View style={styles.count}><Text style={styles.countText}>{activeCount}</Text></View>}
      </Pressable>
    </View>

    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss filters" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View><Text accessibilityRole="header" style={styles.sheetTitle}>Filter products</Text><Text style={styles.sheetHint}>Refine your catalog</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={() => setOpen(false)} style={styles.close}><Ionicons name="close" size={24} color="#252930" /></Pressable>
          </View>
          {!facets ? <View style={styles.message}>{failed ? <><Text style={styles.messageText}>Couldn’t load filters.</Text><Pressable accessibilityRole="button" accessibilityLabel="Retry filters" onPress={() => { setFailed(false); setAttempt(value => value + 1); }} style={styles.retry}><Text style={styles.applyText}>Try again</Text></Pressable></> : <><ActivityIndicator color={accent} /><Text style={styles.messageText}>Loading filters…</Text></>}</View> : <>
            <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
              <FilterGroup title="Category" values={facets.categories} selected={draftCategory} onSelect={setDraftCategory} />
              <FilterGroup title="Brand" values={facets.brands} selected={draftBrand} onSelect={setDraftBrand} />
              <View style={styles.group}>
                <View style={styles.groupHeading}><Text style={styles.groupTitle}>Maximum price</Text><Text style={styles.priceValue}>${Math.round(draftPrice ?? facets.maxPrice)}</Text></View>
                <Slider accessibilityLabel="Maximum price" minimumValue={0} maximumValue={facets.maxPrice} step={1}
                  value={draftPrice ?? facets.maxPrice} onValueChange={setDraftPrice} minimumTrackTintColor={accent} maximumTrackTintColor="#E8EAED" thumbTintColor={accent} />
                <View style={styles.priceRange}><Text style={styles.rangeText}>$0</Text><Text style={styles.rangeText}>${facets.maxPrice}</Text></View>
              </View>
            </ScrollView>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Clear filters" onPress={clear} style={styles.clearButton}><Text style={styles.clearText}>Clear</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Apply filters" onPress={apply} style={styles.applyButton}><Text style={styles.applyText}>Show products</Text></Pressable>
            </View>
          </>}
        </View>
      </View>
    </Modal>
  </View>;
}

function FilterGroup({ title, values, selected, onSelect }: { title: string; values: string[]; selected: string; onSelect: (value: string) => void }) {
  return <View style={styles.group}>
    <View style={styles.groupHeading}><Text style={styles.groupTitle}>{title}</Text>{selected !== '' && <Pressable accessibilityRole="button" accessibilityLabel={`Clear ${title.toLowerCase()}`} onPress={() => onSelect('')}><Text style={styles.clearSmall}>Clear</Text></Pressable>}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {values.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={label(value)} accessibilityState={{ checked: selected === value }}
        onPress={() => onSelect(selected === value ? '' : value)} style={[styles.chip, selected === value && styles.chipSelected]}>
        <Text style={[styles.chipText, selected === value && styles.chipTextSelected]}>{label(value)}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  toolbar: { paddingHorizontal: 24, paddingBottom: 18 },
  searchRow: { flexDirection: 'row', gap: 10 },
  search: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 15, paddingRight: 4, borderRadius: 16, borderWidth: 1, borderColor: '#E7E9ED', backgroundColor: '#F6F7F9' },
  focused: { borderColor: accent, backgroundColor: '#FFFFFF' },
  input: { flex: 1, minWidth: 0, fontSize: 15, color: '#252930', paddingVertical: 14 },
  clearIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  filterButton: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#E2E5E9', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  filterActive: { backgroundColor: accent, borderColor: accent },
  count: { position: 'absolute', right: -4, top: -5, minWidth: 19, height: 19, paddingHorizontal: 4, borderRadius: 10, backgroundColor: '#252930', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  countText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#18202C66' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFFFF', overflow: 'hidden', paddingTop: 8 },
  handle: { width: 42, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: '#D7DADF', marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#ECEEF1' },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#252930' },
  sheetHint: { marginTop: 4, fontSize: 12, color: '#858B94' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  options: { padding: 24, gap: 28 },
  group: { gap: 14 },
  groupHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupTitle: { fontSize: 15, fontWeight: '700', color: '#252930' },
  clearSmall: { color: '#C24F11', fontSize: 12, fontWeight: '600' },
  chips: { flexDirection: 'row', gap: 9, paddingRight: 24 },
  chip: { minHeight: 40, justifyContent: 'center', borderRadius: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E2E5E9', backgroundColor: '#FFFFFF' },
  chipSelected: { borderColor: '#FFC39F', backgroundColor: '#FFF0E6' },
  chipText: { fontSize: 12, color: '#4C535C' },
  chipTextSelected: { color: '#BC4708', fontWeight: '700' },
  priceValue: { fontSize: 15, fontWeight: '700', color: accent },
  priceRange: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeText: { fontSize: 11, color: '#8A9099' },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 24, borderTopWidth: 1, borderColor: '#ECEEF1' },
  clearButton: { width: '30%', minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: '#DADDE2', alignItems: 'center', justifyContent: 'center' },
  clearText: { color: '#343A43', fontSize: 14, fontWeight: '700' },
  applyButton: { flex: 1, minHeight: 52, borderRadius: 16, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  message: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  messageText: { color: '#7E858F', fontSize: 13 },
  retry: { backgroundColor: accent, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
});
