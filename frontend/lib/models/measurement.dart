class Measurement {
  final String id;
  final String type; // 'bague' ou 'bracelet'
  final double valueMm; // valeur en millimètres
  final double? standardSize; // taille standard calculée
  final DateTime date;

  Measurement({
    required this.id,
    required this.type,
    required this.valueMm,
    this.standardSize,
    required this.date,
  });

  factory Measurement.fromJson(Map<String, dynamic> json) {
    return Measurement(
      id: json['_id'] ?? json['id'] ?? '',
      type: json['type'] ?? 'bague',
      valueMm: (json['valueMm'] ?? 0).toDouble(),
      standardSize: json['standardSize'] != null
          ? (json['standardSize'] as num).toDouble()
          : null,
      date: json['date'] != null
          ? DateTime.parse(json['date'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'valueMm': valueMm,
      'standardSize': standardSize,
      'date': date.toIso8601String(),
    };
  }

  // Calculer la taille standard pour une bague
  static double calculateStandardSize(double circumferenceMm) {
    // Formule: (circonférence en mm - 40) / 0.8
    return (circumferenceMm - 40) / 0.8;
  }
}