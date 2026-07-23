import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:pila/models/transaction.dart';
import 'package:pila/screens/form_screen.dart';
import 'package:pila/store/transaction_store.dart';
import 'package:pila/widgets/donut_chart.dart';

class SummaryScreen extends StatefulWidget {
  const SummaryScreen({super.key});

  @override
  State<SummaryScreen> createState() => _SummaryScreenState();
}

class _SummaryScreenState extends State<SummaryScreen> {
  final _store = TransactionStore();
  final _money = NumberFormat.currency(locale: 'pt_BR', symbol: 'R\$');
  List<Transaction> _items = [];
  bool _loading = true;

  static const _categoryColors = <String, Color>{
    'Mercado': Color(0xFF3B82F6),
    'Transporte': Color(0xFF8B5CF6),
    'Alimentação': Color(0xFFF59E0B),
    'Moradia': Color(0xFFEF4444),
    'Lazer': Color(0xFFEC4899),
    'Saúde': Color(0xFF10B981),
    'Outros': Color(0xFF64748B),
  };

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final items = await _store.load();
    setState(() {
      _items = items;
      _loading = false;
    });
  }

  Future<void> _persist() async {
    await _store.save(_items);
  }

  List<Transaction> get _monthItems {
    final now = DateTime.now();
    return _items
        .where((t) => t.createdAt.year == now.year && t.createdAt.month == now.month)
        .toList();
  }

  double get _income => _monthItems
      .where((t) => t.type == TxType.income)
      .fold(0.0, (sum, t) => sum + t.amount);

  double get _expenses => _monthItems
      .where((t) => t.type == TxType.expense)
      .fold(0.0, (sum, t) => sum + t.amount);

  double get _balance => _income - _expenses;

  List<DonutSlice> get _slices {
    final map = <String, double>{};
    for (final t in _monthItems.where((t) => t.isExpense)) {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    }
    if (map.isEmpty) return [];
    return map.entries
        .map(
          (e) => DonutSlice(
            value: e.value,
            color: _categoryColors[e.key] ?? const Color(0xFF94A3B8),
          ),
        )
        .toList();
  }

  IconData _iconFor(String category) {
    switch (category) {
      case 'Mercado':
        return Icons.local_grocery_store_outlined;
      case 'Transporte':
        return Icons.directions_car_outlined;
      case 'Alimentação':
        return Icons.restaurant_outlined;
      case 'Moradia':
        return Icons.home_outlined;
      case 'Lazer':
        return Icons.movie_outlined;
      case 'Saúde':
        return Icons.local_hospital_outlined;
      case 'Salário':
        return Icons.payments_outlined;
      case 'Freelance':
        return Icons.laptop_mac_outlined;
      default:
        return Icons.receipt_long_outlined;
    }
  }

  Future<void> _openForm({Transaction? editing}) async {
    final result = await Navigator.of(context).push<Transaction?>(
      MaterialPageRoute(
        builder: (_) => FormScreen(initial: editing),
      ),
    );

    if (result == null) return;

    setState(() {
      if (editing == null) {
        _items = [result, ..._items];
      } else {
        _items = _items.map((t) => t.id == editing.id ? result : t).toList();
      }
      _items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    });
    await _persist();
  }

  Future<void> _remove(Transaction item) async {
    setState(() {
      _items = _items.where((t) => t.id != item.id).toList();
    });
    await _persist();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                children: [
                  const Text(
                    'Pila',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.6,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _Card(
                    child: Column(
                      children: [
                        Text(
                          'Saldo atual',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _money.format(_balance),
                          style: const TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -1,
                          ),
                        ),
                        const SizedBox(height: 18),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton.icon(
                            onPressed: () => _openForm(),
                            icon: const Icon(Icons.add_circle_outline),
                            label: const Text('Adicionar lançamento'),
                            style: FilledButton.styleFrom(
                              backgroundColor: const Color(0xFF2563EB),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  _Card(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Resumo mensal',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: _Stat(
                                label: 'Receita total',
                                value: _money.format(_income),
                                color: const Color(0xFF16A34A),
                              ),
                            ),
                            Expanded(
                              child: _Stat(
                                label: 'Despesas totais',
                                value: _money.format(_expenses),
                                color: const Color(0xFFDC2626),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Center(child: DonutChart(slices: _slices)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  _Card(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Transações recentes',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 8),
                        if (_items.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 24),
                            child: Center(
                              child: Text(
                                'Nenhuma transação ainda.',
                                style: TextStyle(color: Colors.grey.shade600),
                              ),
                            ),
                          )
                        else
                          ..._items.take(10).map((item) {
                            final date = DateFormat('dd/MM').format(item.createdAt);
                            final sign = item.isExpense ? '-' : '+';
                            final color = item.isExpense
                                ? const Color(0xFFDC2626)
                                : const Color(0xFF16A34A);

                            return Dismissible(
                              key: ValueKey(item.id),
                              direction: DismissDirection.endToStart,
                              background: Container(
                                alignment: Alignment.centerRight,
                                padding: const EdgeInsets.only(right: 16),
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFDC2626),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(
                                  Icons.delete_outline,
                                  color: Colors.white,
                                ),
                              ),
                              onDismissed: (_) => _remove(item),
                              child: InkWell(
                                onTap: () => _openForm(editing: item),
                                borderRadius: BorderRadius.circular(12),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 10,
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 44,
                                        height: 44,
                                        decoration: BoxDecoration(
                                          color: (_categoryColors[item.category] ??
                                                  const Color(0xFF94A3B8))
                                              .withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Icon(
                                          _iconFor(item.category),
                                          color: _categoryColors[item.category] ??
                                              const Color(0xFF64748B),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              '$date | ${item.title}',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              item.category,
                                              style: TextStyle(
                                                color: Colors.grey.shade600,
                                                fontSize: 13,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        '$sign${_money.format(item.amount)}',
                                        style: TextStyle(
                                          color: color,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          }),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 20,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}
