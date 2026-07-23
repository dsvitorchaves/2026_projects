import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import 'package:pila/models/transaction.dart';

class FormScreen extends StatefulWidget {
  const FormScreen({super.key, this.initial});

  final Transaction? initial;

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  late final TextEditingController _titleCtrl;
  late final TextEditingController _amountCtrl;
  late TxType _type;
  late String _category;
  late DateTime _date;

  @override
  void initState() {
    super.initState();
    final initial = widget.initial;
    _titleCtrl = TextEditingController(text: initial?.title ?? '');
    _amountCtrl = TextEditingController(
      text: initial == null
          ? ''
          : initial.amount.toStringAsFixed(2).replaceAll('.', ','),
    );
    _type = initial?.type ?? TxType.expense;
    _category = initial?.category ?? 'Mercado';
    _date = initial?.createdAt ?? DateTime.now();
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  List<String> get _availableCategories {
    if (_type == TxType.income) {
      return ['Salário', 'Freelance', 'Outros'];
    }
    return categories.where((c) => c != 'Salário' && c != 'Freelance').toList();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      locale: const Locale('pt', 'BR'),
    );
    if (picked != null) {
      setState(() => _date = picked);
    }
  }

  void _save() {
    final title = _titleCtrl.text.trim();
    final amount = double.tryParse(
      _amountCtrl.text.replaceAll('.', '').replaceAll(',', '.'),
    );

    if (title.isEmpty || amount == null || amount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preencha descrição e valor')),
      );
      return;
    }

    final cats = _availableCategories;
    final category = cats.contains(_category) ? _category : cats.first;

    final item = Transaction(
      id: widget.initial?.id ?? const Uuid().v4(),
      title: title,
      amount: amount,
      category: category,
      type: _type,
      createdAt: _date,
    );

    Navigator.of(context).pop(item);
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.initial != null;
    final cats = _availableCategories;
    final selectedCategory =
        cats.contains(_category) ? _category : cats.first;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Editar lançamento' : 'Novo lançamento'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFE8EEF8),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _TypeChip(
                    label: 'Despesa',
                    selected: _type == TxType.expense,
                    onTap: () => setState(() {
                      _type = TxType.expense;
                      _category = 'Mercado';
                    }),
                  ),
                ),
                Expanded(
                  child: _TypeChip(
                    label: 'Receita',
                    selected: _type == TxType.income,
                    onTap: () => setState(() {
                      _type = TxType.income;
                      _category = 'Salário';
                    }),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _amountCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9,.]')),
            ],
            decoration: InputDecoration(
              labelText: 'Valor',
              prefixText: 'R\$ ',
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _titleCtrl,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(
              labelText: 'Descrição',
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<String>(
            key: ValueKey('${_type.name}-$selectedCategory'),
            initialValue: selectedCategory,
            items: cats
                .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                .toList(),
            onChanged: (value) {
              if (value != null) setState(() => _category = value);
            },
            decoration: InputDecoration(
              labelText: 'Categoria',
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          const SizedBox(height: 14),
          InkWell(
            onTap: _pickDate,
            borderRadius: BorderRadius.circular(14),
            child: InputDecorator(
              decoration: InputDecoration(
                labelText: 'Data',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(DateFormat('dd/MM/yyyy').format(_date)),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _save,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: Text(isEdit ? 'Atualizar' : 'Salvar'),
          ),
        ],
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  const _TypeChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? Colors.white : Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: selected ? const Color(0xFF2563EB) : Colors.grey.shade700,
            ),
          ),
        ),
      ),
    );
  }
}
