export class Order {
    constructor () {
        this.id = "";
        this.order_no = "";
        this.order_status = "";
        this.enterprise_id = "";
        this.products = [];
        this.product_amount = 0;
        this.order_amount = 0;
        this.order_date = null;
        this.delivered_date =  null;
        this.paid_date = null
    }
}