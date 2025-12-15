class Order {
  final String id;
  final String status;
  final double totalPrice;
  final int quantity;
  final String productTitle;
  final String buyerName;
  final String buyerEmail;
  final String createdAt;

  Order({
    required this.id,
    required this.status,
    required this.totalPrice,
    required this.quantity,
    required this.productTitle,
    required this.buyerName,
    required this.buyerEmail,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? 'N/A',
      status: json['status'] ?? 'pending',
      totalPrice: (json['totalPrice'] ?? 0).toDouble(),
      quantity: json['quantity'] ?? 0,
      productTitle: json['product']?['title'] ?? 'Produit inconnu',
      buyerName: json['buyer']?['name'] ?? 'Acheteur inconnu',
      buyerEmail: json['buyer']?['email'] ?? 'Email inconnu',
      createdAt: json['createdAt'] ?? 'Date inconnue',
    );
  }
}
