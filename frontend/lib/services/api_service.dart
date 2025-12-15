import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';
import '../models/order.dart';
import '../models/measurement.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  Future<void> deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 201) {
        if (data['token'] != null) {
          await saveToken(data['token']);
        }
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Erreur'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> registerSeller({
    required String name,
    required String email,
    required String password,
    required String shopName,
    String? description,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register-seller'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'shopName': shopName,
          'description': description,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 201) {
        if (data['token'] != null) {
          await saveToken(data['token']);
        }
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Erreur'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        if (data['token'] != null) {
          await saveToken(data['token']);
        }
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Erreur'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> getGoldPrices() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/gold-prices'));
      if (response.statusCode == 200) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': 'Erreur de chargement'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> getCatalog() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/catalog'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<Product> products = (data['products'] as List)
            .map((json) => Product.fromJson(json))
            .toList();
        return {'success': true, 'products': products};
      } else {
        return {'success': false, 'message': 'Erreur de chargement'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> saveMeasurement({
    required String type,
    required double valueMm,
  }) async {
    try {
      final headers = await getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/measurements'),
        headers: headers,
        body: jsonEncode({
          'type': type,
          'valueMm': valueMm,
        }),
      );
      if (response.statusCode == 201) {
        return {'success': true, 'data': jsonDecode(response.body)};
      } else {
        return {'success': false, 'message': 'Erreur d\'enregistrement'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> getMeasurements() async {
    try {
      final headers = await getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/measurements'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<Measurement> measurements = (data['measurements'] as List)
            .map((json) => Measurement.fromJson(json))
            .toList();
        return {'success': true, 'measurements': measurements};
      } else {
        return {'success': false, 'message': 'Erreur de chargement des mesures'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> createProduct({
    required String title,
    required String description,
    required int carat,
    required double weight,
    required double price,
    required int stock,
    String? imageUrl,
  }) async {
    try {
      final headers = await getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/seller/products'),
        headers: headers,
        body: jsonEncode({
          'title': title,
          'description': description,
          'carat': carat,
          'weight': weight,
          'price': price,
          'stock': stock,
          'imageUrl': imageUrl,
        }),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 201) {
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Erreur'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> getMyProducts() async {
    try {
      final headers = await getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/seller/products'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<Product> products = (data['products'] as List)
            .map((json) => Product.fromJson(json))
            .toList();
        return {'success': true, 'products': products};
      } else {
        return {'success': false, 'message': 'Erreur de chargement'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> getMyOrders() async {
    try {
      final headers = await getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/seller/orders'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<Order> orders = (data['orders'] as List)
            .map((json) => Order.fromJson(json))
            .toList();
        return {'success': true, 'orders': orders};
      } else {
        return {'success': false, 'message': 'Erreur de chargement des commandes'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> getStatistics() async {
    try {
      final headers = await getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/seller/statistics'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Extraire les statistiques de l'objet 'statistics' et mapper les clés
        final statistics = data['statistics'] ?? {};
        final mappedData = {
          'totalProducts': statistics['productCount'] is int 
              ? statistics['productCount'] 
              : (statistics['productCount'] as num?)?.toInt() ?? 0,
          'totalOrders': statistics['orderCount'] is int 
              ? statistics['orderCount'] 
              : (statistics['orderCount'] as num?)?.toInt() ?? 0,
          'totalRevenue': statistics['totalRevenue'] is double 
              ? statistics['totalRevenue'] 
              : (statistics['totalRevenue'] as num?)?.toDouble() ?? 0.0,
          'averagePrice': statistics['averagePrice'] is double 
              ? statistics['averagePrice'] 
              : (statistics['averagePrice'] as num?)?.toDouble() ?? 0.0,
          'averageRating': 0.0, // Pas encore implémenté dans le backend
        };
        return {'success': true, 'data': mappedData};
      } else {
        return {'success': false, 'message': 'Erreur de chargement'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }

  Future<Map<String, dynamic>> deleteProduct(String productId) async {
    try {
      final headers = await getHeaders();
      final response = await http.delete(
        Uri.parse('$baseUrl/seller/products/$productId'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Produit supprimé'};
      } else {
        return {'success': false, 'message': 'Erreur de suppression'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Erreur: $e'};
    }
  }
}
