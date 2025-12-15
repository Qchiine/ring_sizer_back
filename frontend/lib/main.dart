import 'package:flutter/material.dart';
import 'screens/common/splash_screen.dart';

void main() {
  runApp(const RingSizerApp());
}

class RingSizerApp extends StatelessWidget {
  const RingSizerApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ring Sizer',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        scaffoldBackgroundColor: Colors.white,
        fontFamily: 'Roboto',
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.light,
        ),
      ),
      home: const SplashScreen(),
    );
  }
}