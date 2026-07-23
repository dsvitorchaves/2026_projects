import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:pila/models/transaction.dart';

class TransactionStore {
  static const _key = 'pila_transactions';
  static const _seedKey = 'pila_demo_v3';

  List<Transaction> _demo() {
    final now = DateTime.now();
    return [
      Transaction(
        id: 't1',
        title: 'Salário',
        amount: 4500,
        category: 'Salário',
        type: TxType.income,
        createdAt: now.subtract(const Duration(days: 2)),
      ),
      Transaction(
        id: 't2',
        title: 'Freelance',
        amount: 800,
        category: 'Freelance',
        type: TxType.income,
        createdAt: now.subtract(const Duration(days: 10)),
      ),
      Transaction(
        id: 't3',
        title: 'Supermercado',
        amount: 186.40,
        category: 'Mercado',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(days: 1)),
      ),
      Transaction(
        id: 't4',
        title: 'Uber',
        amount: 27.50,
        category: 'Transporte',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(hours: 5)),
      ),
      Transaction(
        id: 't5',
        title: 'Netflix',
        amount: 55.90,
        category: 'Lazer',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(days: 3)),
      ),
      Transaction(
        id: 't6',
        title: 'Almoço',
        amount: 42,
        category: 'Alimentação',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(days: 4)),
      ),
      Transaction(
        id: 't7',
        title: 'Farmácia',
        amount: 64.20,
        category: 'Saúde',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(days: 5)),
      ),
      Transaction(
        id: 't8',
        title: 'Aluguel',
        amount: 1200,
        category: 'Moradia',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(days: 6)),
      ),
      Transaction(
        id: 't9',
        title: 'Combustível',
        amount: 210,
        category: 'Transporte',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(days: 7)),
      ),
      Transaction(
        id: 't10',
        title: 'Café',
        amount: 18.90,
        category: 'Alimentação',
        type: TxType.expense,
        createdAt: now.subtract(const Duration(days: 8)),
      ),
    ];
  }

  Future<List<Transaction>> load() async {
    final prefs = await SharedPreferences.getInstance();

    if (prefs.getBool(_seedKey) != true) {
      final demo = _demo();
      await prefs.setString(
        _key,
        jsonEncode(demo.map((e) => e.toJson()).toList()),
      );
      await prefs.setBool(_seedKey, true);
      return demo..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }

    final raw = prefs.getString(_key);
    if (raw == null || raw.isEmpty) return [];

    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((item) => Transaction.fromJson(item as Map<String, dynamic>))
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<void> save(List<Transaction> items) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode(items.map((e) => e.toJson()).toList()),
    );
    await prefs.setBool(_seedKey, true);
  }
}
