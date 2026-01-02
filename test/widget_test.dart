import 'package:flutter_test/flutter_test.dart';
import 'package:padelhouse/main.dart';

void main() {
  testWidgets('PadelHouse app starts with splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const PadelHouseApp());
    
    // Verify the logo is displayed on splash screen
    expect(find.text('padelhouse'), findsOneWidget);
  });
}
