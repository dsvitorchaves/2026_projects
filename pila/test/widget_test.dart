import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:pila/app.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('abre o resumo do Pila', (tester) async {
    await tester.pumpWidget(const PilaApp());
    await tester.pumpAndSettle();

    expect(find.text('Pila'), findsOneWidget);
    expect(find.text('Saldo atual'), findsOneWidget);
    expect(find.text('Adicionar lançamento'), findsOneWidget);
  });
}
