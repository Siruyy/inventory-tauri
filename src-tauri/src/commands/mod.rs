pub mod auth;
pub mod category;
pub mod product;
pub mod transaction;
pub mod file;

pub use auth::{login, register};
pub use category::{get_all_categories, add_category, delete_category, update_category};
pub use product::{
    get_all_products, get_products_by_category,
    add_product, update_product, delete_product, update_product_stock
};
pub use transaction::{
    create_order, get_order_by_id, get_order_items, get_order_with_items,
    get_recent_orders, get_order_history, get_order_statistics, get_sales_report_data,
    debug_order_dates, update_order_dates_to_today, test_date_filtering, debug_date_filtering,
    debug_order_dates_extended, test_exact_date_filter, debug_daily_sales
};
pub use file::read_image_to_base64;
