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
        description -> Text,
        sku -> Text,
        category_id -> Integer,
        quantity -> Integer,
        unit_price -> Double,
        location -> Text,
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
