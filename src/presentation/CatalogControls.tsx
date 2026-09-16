import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CatalogFilters, fetchCategories } from '../data/products';

const label = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
const statuses = [{ value: 'all', label: 'All statuses' }, { value: 'in', label: 'In stock' }, { value: 'out', label: 'Out of stock' }];
type Props = { query: string; category: string; stock: NonNullable<CatalogFilters['stock']>; onQuery: (value: string) => void; onCategory: (value: string) => void; onStock: (value: NonNullable<CatalogFilters['stock']>) => void };

export default function CatalogControls({ query, category, stock, onQuery, onCategory, onStock }: Props) {
  const [menu, setMenu] = useState<'Status' | 'Category' | null>(null);
  const [focused, setFocused] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryState, setCategoryState] = useState<'loading' | 'error' | 'success'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal).then(values => {
      if (!controller.signal.aborted) { setCategories(values); setCategoryState('success'); }
    }).catch(() => { if (!controller.signal.aborted) setCategoryState('error'); });
    return () => controller.abort();
  }, [attempt]);
  const options = menu === 'Status' ? statuses : [{ value: '', label: 'All categories' }, ...categories.map(value => ({ value, label: label(value) }))];
  return <View style={styles.toolbar}>
    <View style={[styles.search, focused && styles.focused]}>
      <Ionicons name="search-outline" size={21} color={focused ? '#E86619' : '#7E858F'} />
      <TextInput accessibilityLabel="Search products" placeholder="Search products…" placeholderTextColor="#858B94" value={query}
        onChangeText={onQuery} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoCapitalize="none" autoCorrect={false}
        returnKeyType="search" onSubmitEditing={Keyboard.dismiss} style={styles.input} />
      {query !== '' && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onQuery('')} style={styles.clear}><Ionicons name="close-circle" size={20} color="#858B94" /></Pressable>}
    </View>
    <View style={styles.fields}>
      {(['Status', 'Category'] as const).map(field => {
        const selected = field === 'Status' ? statuses.find(option => option.value === stock)!.label : category ? label(category) : 'All categories';
        const active = field === 'Status' ? stock !== 'all' : Boolean(category);
        return <Pressable key={field} accessibilityRole="combobox" accessibilityLabel={`${field}, ${selected}`} accessibilityState={{ expanded: menu === field }}
          onPress={() => { Keyboard.dismiss(); setMenu(field); }} style={[styles.field, active && styles.active]}>
          <View style={styles.fieldText}><Text style={styles.caption}>{field}</Text><Text numberOfLines={1} style={[styles.value, active && styles.activeText]}>{selected}</Text></View>
          <Ionicons name="chevron-down" size={16} color={active ? '#C85715' : '#858B94'} />
        </Pressable>;
      })}
    </View>
    <Modal visible={menu !== null} transparent animationType="fade" onRequestClose={() => setMenu(null)}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss options" onPress={() => setMenu(null)} style={StyleSheet.absoluteFill} />
        <View style={styles.menu} accessibilityViewIsModal>
          <View style={styles.menuHeader}><Text accessibilityRole="header" style={styles.menuTitle}>Select {menu?.toLowerCase()}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close options" onPress={() => setMenu(null)} style={styles.clear}><Ionicons name="close" size={23} color="#252930" /></Pressable></View>
          {menu === 'Category' && categoryState !== 'success' ? <View style={styles.message}>
            {categoryState === 'loading' ? <><ActivityIndicator color="#E86619" /><Text>Loading categories…</Text></> : <>
              <Text>Couldn’t load categories.</Text><Pressable accessibilityRole="button" onPress={() => { setCategoryState('loading'); setAttempt(value => value + 1); }} style={styles.option}><Text style={styles.activeText}>Retry categories</Text></Pressable>
            </>}
          </View> : <ScrollView keyboardShouldPersistTaps="handled">
            {options.map(option => {
              const selected = option.value === (menu === 'Status' ? stock : category);
              return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: selected }}
                onPress={() => { if (menu === 'Status') onStock(option.value as Props['stock']); else onCategory(option.value); setMenu(null); }} style={[styles.option, selected && styles.selected]}>
                <Text style={[styles.optionText, selected && styles.activeText]}>{option.label}</Text>{selected && <Ionicons name="checkmark" size={20} color="#C85715" />}
              </Pressable>;
            })}
          </ScrollView>}
        </View>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  toolbar: { paddingHorizontal: 24, gap: 12, paddingBottom: 18 },
  search: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 15, paddingRight: 4, borderRadius: 16, borderWidth: 1, borderColor: '#E7E9ED', backgroundColor: '#F6F7F9' },
  focused: { borderColor: '#E86619', backgroundColor: '#FFFFFF' },
  input: { flex: 1, minWidth: 0, fontSize: 15, color: '#252930', paddingVertical: 14 },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  fields: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, minHeight: 62, borderWidth: 1, borderColor: '#E7E9ED', borderRadius: 14 },
  fieldText: { flex: 1, gap: 5 },
  caption: { fontSize: 10, color: '#858B94', fontWeight: '600' },
  value: { fontSize: 13, color: '#343A43', fontWeight: '600' },
  active: { backgroundColor: '#FFF7F0', borderColor: '#F3CAA9' },
  activeText: { color: '#B94C12', fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#18202C66', padding: 24 },
  menu: { width: '100%', maxWidth: 480, maxHeight: '75%', borderRadius: 22, backgroundColor: '#FFFFFF', overflow: 'hidden', paddingBottom: 10 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 20, paddingRight: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ECEEF1' },
  menuTitle: { fontSize: 18, fontWeight: '700', color: '#252930' },
  option: { minHeight: 50, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  optionText: { flex: 1, fontSize: 14, color: '#343A43' },
  selected: { backgroundColor: '#FFF1E5' },
  message: { padding: 24, alignItems: 'center', gap: 14 },
});
