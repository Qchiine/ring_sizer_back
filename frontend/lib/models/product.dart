class Product {
  final String id;
  final String title;
  final String description;
  final int carat;
  final double weight;
  final double price;
  final int stock;
  final String? imageUrl;
  final String sellerId;

  Product({
    required this.id,
    required this.title,
    required this.description,
    required this.carat,
    required this.weight,
    required this.price,
    required this.stock,
    this.imageUrl,
    required this.sellerId,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Gérer sellerId qui peut être un objet (populate) ou une string
    String sellerIdValue;
    if (json['sellerId'] != null) {
      // Si c'est un objet (populate), extraire l'ID
      if (json['sellerId'] is Map) {
        sellerIdValue = json['sellerId']['_id']?.toString() ?? '';
      } else {
        sellerIdValue = json['sellerId'].toString();
      }
    } else if (json['seller'] != null) {
      // Fallback pour compatibilité avec ancienne structure
      if (json['seller'] is Map) {
        sellerIdValue = json['seller']['_id']?.toString() ?? '';
      } else {
        sellerIdValue = json['seller'].toString();
      }
    } else {
      throw Exception('sellerId manquant dans les données du produit');
    }

    // Gérer imageUrl qui peut être null, une chaîne vide, ou une string
    String? imageUrlValue;
    if (json['imageUrl'] != null && json['imageUrl'].toString().trim().isNotEmpty) {
      imageUrlValue = json['imageUrl'].toString();
    }

    return Product(
      id: json['_id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      carat: json['carat'] is int ? json['carat'] : (json['carat'] as num).toInt(),
      weight: json['weight'] is double 
          ? json['weight'] 
          : (json['weight'] as num).toDouble(),
      price: json['price'] is double 
          ? json['price'] 
          : (json['price'] as num).toDouble(),
      stock: json['stock'] is int ? json['stock'] : (json['stock'] as num).toInt(),
      imageUrl: imageUrlValue,
      sellerId: sellerIdValue,
    );
  }

  String getIcon() {
    if (title.toLowerCase().contains('bague')) return '💍';
    if (title.toLowerCase().contains('collier')) return '💎';
    if (title.toLowerCase().contains('boucles')) return '👂';
    if (title.toLowerCase().contains('bracelet')) return '✨';
    return '👑';
  }
}
