// @generated automatically by Diesel CLI.

diesel::table! {
    categories (id) {
        id -> Integer,
        name -> Text,
        description -> Text,
        created_at -> Text,
        updated_at -> Text,
    }
}

diesel::table! {
    products (id) {
        id -> Integer,
        name -> Text,
        description -> Nullable<Text>,
        sku -> Text,
        category_id -> Integer,
        current_stock -> Integer,
        minimum_stock -> Integer,
        unit_price -> Double,
        supplier -> Nullable<Text>,
        created_at -> Text,
        updated_at -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Integer,
        username -> Text,
        email -> Text,
        password_hash -> Text,
        full_name -> Text,
        role -> Text,
        created_at -> Text,
        updated_at -> Text,
    }
}

diesel::joinable!(products -> categories (category_id));

diesel::allow_tables_to_appear_in_same_query!(
    categories,
    products,
    users,
);
