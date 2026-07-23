enum TxType { expense, income }

class Transaction {
  Transaction({
    required this.id,
    required this.title,
    required this.amount,
    required this.category,
    required this.type,
    required this.createdAt,
  });

  final String id;
  final String title;
  final double amount;
  final String category;
  final TxType type;
  final DateTime createdAt;

  bool get isExpense => type == TxType.expense;

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'amount': amount,
        'category': category,
        'type': type.name,
        'createdAt': createdAt.toIso8601String(),
      };

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as String,
      title: json['title'] as String,
      amount: (json['amount'] as num).toDouble(),
      category: (json['category'] as String?) ?? 'Outros',
      type: (json['type'] as String?) == 'income'
          ? TxType.income
          : TxType.expense,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

const categories = [
  'Mercado',
  'Transporte',
  'Alimentação',
  'Moradia',
  'Lazer',
  'Saúde',
  'Salário',
  'Freelance',
  'Outros',
];
