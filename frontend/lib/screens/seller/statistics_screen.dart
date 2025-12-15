import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class StatisticsScreen extends StatefulWidget {
  const StatisticsScreen({Key? key}) : super(key: key);

  @override
  State<StatisticsScreen> createState() => _StatisticsScreenState();
}

class _StatisticsScreenState extends State<StatisticsScreen> {
  final ApiService _apiService = ApiService();
  Map<String, dynamic>? _stats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStatistics();
  }

  Future<void> _loadStatistics() async {
    setState(() => _isLoading = true);

    final result = await _apiService.getStatistics();

    if (mounted) {
      if (result['success']) {
        setState(() {
          _stats = result['data'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _stats = {
            'totalProducts': 0,
            'totalOrders': 0,
            'totalRevenue': 0.0,
            'averageRating': 0.0,
            'averagePrice': 0.0,
            'lowStockProducts': 0,
          };
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.center,
            colors: [
              Colors.deepPurple.shade400,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              // AppBar
              SliverAppBar(
                title: const Text('Statistiques'),
                backgroundColor: Colors.transparent,
                elevation: 0,
                pinned: true,
                actions: [
                  IconButton(
                    icon: const Icon(Icons.refresh),
                    onPressed: _loadStatistics,
                  ),
                ],
              ),

              // Contenu
              SliverToBoxAdapter(
                child: _isLoading
                    ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(100.0),
                    child: CircularProgressIndicator(
                      color: Colors.white,
                    ),
                  ),
                )
                    : Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Vue d'ensemble
                      const Text(
                        'Vue d\'ensemble',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Grille de stats principales
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        childAspectRatio: 1.3,
                        crossAxisSpacing: 15,
                        mainAxisSpacing: 15,
                        children: [
                          _buildMainStatCard(
                            '${_stats?['totalProducts'] ?? 0}',
                            'Produits',
                            Icons.inventory_2,
                            Colors.blue,
                          ),
                          _buildMainStatCard(
                            '${_stats?['totalOrders'] ?? 0}',
                            'Commandes',
                            Icons.shopping_cart,
                            Colors.orange,
                          ),
                          _buildMainStatCard(
                            '${(_stats?['totalRevenue'] ?? 0).toStringAsFixed(0)}€',
                            'Revenus',
                            Icons.attach_money,
                            Colors.green,
                          ),
                          _buildMainStatCard(
                            '${(_stats?['averageRating'] ?? 0).toStringAsFixed(1)}⭐',
                            'Note',
                            Icons.star,
                            Colors.amber,
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),

                      // Détails
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.grey.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Détails',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 20),

                            _buildDetailRow(
                              'Prix moyen',
                              '${(_stats?['averagePrice'] ?? 0).toStringAsFixed(2)}€',
                              Icons.trending_up,
                              Colors.blue,
                            ),
                            const Divider(height: 30),

                            _buildDetailRow(
                              'Produits en stock faible',
                              '${_stats?['lowStockProducts'] ?? 0}',
                              Icons.warning_amber,
                              Colors.orange,
                            ),
                            const Divider(height: 30),

                            _buildDetailRow(
                              'Taux de conversion',
                              '${_calculateConversionRate()}%',
                              Icons.analytics,
                              Colors.green,
                            ),
                            const Divider(height: 30),

                            _buildDetailRow(
                              'Valeur moyenne commande',
                              '${_calculateAverageOrderValue()}€',
                              Icons.monetization_on,
                              Colors.purple,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Performance
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.deepPurple.shade400,
                              Colors.purple.shade600,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Icons.trending_up,
                                  color: Colors.white,
                                  size: 30,
                                ),
                                const SizedBox(width: 15),
                                const Text(
                                  'Performance',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),
                            _buildPerformanceItem(
                              'Chiffre d\'affaires',
                              '${(_stats?['totalRevenue'] ?? 0).toStringAsFixed(2)}€',
                            ),
                            const SizedBox(height: 15),
                            _buildPerformanceItem(
                              'Nombre de ventes',
                              '${_stats?['totalOrders'] ?? 0}',
                            ),
                            const SizedBox(height: 15),
                            _buildPerformanceItem(
                              'Taux de satisfaction',
                              '${((_stats?['averageRating'] ?? 0) * 20).toStringAsFixed(0)}%',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Conseils
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(15),
                          border: Border.all(
                            color: Colors.blue.shade200,
                            width: 2,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.lightbulb_outline,
                              color: Colors.blue.shade700,
                              size: 30,
                            ),
                            const SizedBox(width: 15),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Conseil',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue.shade900,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    _getAdvice(),
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.blue.shade800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainStatCard(
      String value,
      String label,
      IconData icon,
      Color color,
      ) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color, color.withOpacity(0.7)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.white, size: 30),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
      String label,
      String value,
      IconData icon,
      Color color,
      ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceItem(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: Colors.white.withOpacity(0.9),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  double _calculateConversionRate() {
    final products = _stats?['totalProducts'] ?? 0;
    final orders = _stats?['totalOrders'] ?? 0;
    if (products == 0) return 0;
    return ((orders / products) * 100);
  }

  String _calculateAverageOrderValue() {
    final revenue = _stats?['totalRevenue'] ?? 0;
    final orders = _stats?['totalOrders'] ?? 0;
    if (orders == 0) return '0.00';
    return (revenue / orders).toStringAsFixed(2);
  }

  String _getAdvice() {
    final products = _stats?['totalProducts'] ?? 0;
    final orders = _stats?['totalOrders'] ?? 0;
    final lowStock = _stats?['lowStockProducts'] ?? 0;

    if (products == 0) {
      return 'Ajoutez vos premiers produits pour commencer à vendre !';
    } else if (lowStock > 0) {
      return 'Attention ! $lowStock produit(s) ont un stock faible. Pensez à réapprovisionner.';
    } else if (orders < 5) {
      return 'Partagez votre boutique sur les réseaux sociaux pour augmenter vos ventes !';
    } else {
      return 'Excellente performance ! Continuez à ajouter de nouveaux produits.';
    }
  }
}