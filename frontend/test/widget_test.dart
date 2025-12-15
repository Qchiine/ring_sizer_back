import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mon_app/main.dart';
import 'package:mon_app/screens/common/splash_screen.dart';

void main() {
  testWidgets('App starts without errors', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const RingSizerApp());

    // Verify that the app starts without crashing.
    // As the app has evolved, the old counter test is no longer valid.
    // We now simply check if the first screen (SplashScreen) is rendered.
    expect(find.byType(SplashScreen), findsOneWidget);

    // The following is the original counter test, commented out for reference.
    /*
    // Verify that our counter starts at 0.
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    // Tap the '+' icon and trigger a frame.
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    // Verify that our counter has incremented.
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
    */
  });
}
