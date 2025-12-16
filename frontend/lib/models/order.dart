class Order {
  final String id;
  final String status;
  final double totalPrice;
  final int quantity;
  final String productTitle;
  final String? productId;
  final String? buyerName;
  final String? buyerEmail;
  final String? userId;
  final String? createdAt;
  final String? date;

  Order({
    required this.id,
    required this.status,
    required this.totalPrice,
    required this.quantity,
    required this.productTitle,
    this.productId,
    this.buyerName,
    this.buyerEmail,
    this.userId,
    this.createdAt,
    this.date,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    // Gérer productId qui peut être un objet (populate) ou une string
    String? productIdValue;
    String productTitleValue = 'Produit inconnu'; // Initialiser avec une valeur par défaut
    
    if (json['productId'] != null) {
      if (json['productId'] is Map) {
        productIdValue = json['productId']['_id']?.toString();
        productTitleValue = json['productId']['title']?.toString() ?? 'Produit inconnu';
      } else {
        productIdValue = json['productId'].toString();
        // Si productId n'est pas un Map, on ne peut pas extraire le titre
        // productTitleValue garde sa valeur par défaut
      }
    } else if (json['product'] != null) {
      if (json['product'] is Map) {
        productIdValue = json['product']['_id']?.toString();
        productTitleValue = json['product']['title']?.toString() ?? 'Produit inconnu';
      }
    }

    // Gérer userId qui peut être un objet (populate) ou une string
    String? userIdValue;
    String? buyerNameValue;
    String? buyerEmailValue;
    
    if (json['userId'] != null) {
      if (json['userId'] is Map) {
        userIdValue = json['userId']['_id']?.toString();
        buyerNameValue = json['userId']['name']?.toString();
        buyerEmailValue = json['userId']['email']?.toString();
      } else {
        userIdValue = json['userId'].toString();
      }
    } else if (json['buyer'] != null) {
      if (json['buyer'] is Map) {
        userIdValue = json['buyer']['_id']?.toString();
        buyerNameValue = json['buyer']['name']?.toString();
        buyerEmailValue = json['buyer']['email']?.toString();
      }
    }

    return Order(
      id: json['_id']?.toString() ?? '',
      status: json['status']?.toString() ?? 'pending',
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
      quantity: json['quantity'] is int ? json['quantity'] : (json['quantity'] as num).toInt(),
      productTitle: productTitleValue,
      productId: productIdValue,
      buyerName: buyerNameValue,
      buyerEmail: buyerEmailValue,
      userId: userIdValue,
      createdAt: json['createdAt']?.toString(),
      date: json['date']?.toString(),
    );
  }

  String getDisplayDate() {
    if (date != null && date!.isNotEmpty) {
      return date!;
    }
    if (createdAt != null && createdAt!.isNotEmpty) {
      return createdAt!;
    }
    return 'Date inconnue';
  }
}
