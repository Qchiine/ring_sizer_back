import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/measurement.dart';

class SizeCalculatorScreen extends StatefulWidget {
  const SizeCalculatorScreen({Key? key}) : super(key: key);

  @override
  State<SizeCalculatorScreen> createState() => _SizeCalculatorScreenState();
}

class _SizeCalculatorScreenState extends State<SizeCalculatorScreen> {
  final _circumferenceController = TextEditingController();
  final ApiService _apiService = ApiService();

  String _selectedType = 'bague';
  double? _calculatedSize;
  bool _isCalculating = false;
  bool _isSaving = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Calculer ma taille'),
        backgroundColor: Colors.deepPurple,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Sélection du type
            const Text(
              'Type de bijou',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),
            Row(
              children: [
                Expanded(
                  child: _buildTypeCard(
                    'bague',
                    'Bague',
                    Icons.ring_volume,
                    Colors.pink,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: _buildTypeCard(
                    'bracelet',
                    'Bracelet',
                    Icons.watch,
                    Colors.blue,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),

            // Guide visuel
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withAlpha(26),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Icon(
                    _selectedType == 'bague'
                        ? Icons.ring_volume
                        : Icons.watch,
                    size: 80,
                    color: _selectedType == 'bague'
                        ? Colors.pink
                        : Colors.blue,
                  ),
                  const SizedBox(height: 15),
                  Text(
                    _selectedType == 'bague'
                        ? 'Comment mesurer votre doigt ?'
                        : 'Comment mesurer votre poignet ?',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _selectedType == 'bague'
                        ? '1. Enroulez un fil autour de votre doigt\n2. Marquez le point de rencontre\n3. Mesurez la longueur en mm'
                        : '1. Enroulez un mètre souple autour du poignet\n2. Ajoutez 1-2 cm pour le confort\n3. Notez la mesure en mm',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[600],
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            // Saisie de la mesure
            const Text(
              'Entrez votre mesure',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 15),
            TextField(
              controller: _circumferenceController,
              decoration: InputDecoration(
                labelText: 'Circonférence (mm)',
                hintText: 'Ex: 52.5',
                prefixIcon: const Icon(Icons.straighten),
                suffixText: 'mm',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
            ),
            const SizedBox(height: 20),

            // Bouton calculer
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isCalculating ? null : _calculateSize,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isCalculating
                    ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
                    : const Text(
                  'Calculer',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),

            // Résultat
            if (_calculatedSize != null) ...[
              const SizedBox(height: 30),
              Container(
                padding: const EdgeInsets.all(25),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.deepPurple.shade400, Colors.purple.shade600],
                  ),
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.deepPurple.withAlpha(77),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const Text(
                      'Votre taille',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _calculatedSize!.toStringAsFixed(1),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      _selectedType == 'bague'
                          ? 'Taille française'
                          : 'Circonférence poignet',
                      style: TextStyle(
                        color: Colors.white.withAlpha(230),
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _saveMeasurement,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.deepPurple,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: _isSaving
                            ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                          ),
                        )
                            : const Text(
                          'Enregistrer cette mesure',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTypeCard(
      String value,
      String label,
      IconData icon,
      Color color,
      ) {
    final isSelected = _selectedType == value;
    return GestureDetector(
      onTap: () => setState(() {
        _selectedType = value;
        _calculatedSize = null;
      }),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? color.withAlpha(26) : Colors.white,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: isSelected ? color : Colors.grey.shade300,
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 40,
              color: isSelected ? color : Colors.grey[600],
            ),
            const SizedBox(height: 10),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isSelected ? color : Colors.grey[700],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _calculateSize() async {
    final circumference = double.tryParse(_circumferenceController.text);

    if (circumference == null || circumference <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez entrer une mesure valide'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isCalculating = true);

    try {
      if (_selectedType == 'bague') {
        // Calculer la taille pour une bague
        final size = Measurement.calculateStandardSize(circumference);
        setState(() {
          _calculatedSize = size;
          _isCalculating = false;
        });
      } else {
        // Pour un bracelet, on garde la circonférence
        setState(() {
          _calculatedSize = circumference;
          _isCalculating = false;
        });
      }
    } catch (e) {
      setState(() => _isCalculating = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _saveMeasurement() async {
    if (_calculatedSize == null) return;

    setState(() => _isSaving = true);

    try {
      final circumference = double.parse(_circumferenceController.text);

      final result = await _apiService.saveMeasurement(
        type: _selectedType,
        valueMm: circumference,
      );

      if (mounted) {
        if (result['success']) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Mesure enregistrée avec succès!'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'Erreur d\'enregistrement'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  void dispose() {
    _circumferenceController.dispose();
    super.dispose();
  }
}
