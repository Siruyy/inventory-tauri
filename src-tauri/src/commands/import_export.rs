use crate::db::models::order::DetailedSale;
use crate::invoke_handler;
use chrono::Local;
use serde::{Deserialize, Serialize};
use simple_excel_writer::{row, Row, Workbook};
use std::path::Path;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportRequest {
    pub detailed_sales: Vec<DetailedSale>,
    pub sales_summary: SalesSummary,
    pub path: String,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SalesSummary {
    pub total_sales: f64,
    pub total_revenue: f64,
    pub total_profit: f64,
    pub items_sold: i64,
    pub transactions: i64,
}

#[tauri::command]
pub async fn export_sales_report(request: ExportRequest) -> Result<String, String> {
    // Validate path directory exists
    let path = Path::new(&request.path);
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            return Err("Invalid export path".into());
        }
    }

    // Create workbook
    let mut wb = Workbook::create(&request.path);

    // Summary sheet
    let mut summary_sheet = wb.create_sheet("Summary");

    // Title row
    summary_sheet.add_row(row!["Sales Report Summary"]);

    // Metadata rows
    let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    summary_sheet.add_row(row!["Exported on:", now]);

    match (&request.start_date, &request.end_date) {
        (Some(start), Some(end)) => {
            summary_sheet.add_row(row!["Date Range:", format!("{} to {}", start, end)]);
        }
        _ => {
            summary_sheet.add_row(row!["Date Range:", "All Time"]);
        }
    }

    // Blank row
    summary_sheet.add_row(Row::new());

    // Summary metrics
    summary_sheet.add_row(row!["Total Sales Amount", request.sales_summary.total_sales]);
    summary_sheet.add_row(row!["Total Revenue", request.sales_summary.total_revenue]);
    summary_sheet.add_row(row!["Total Profit", request.sales_summary.total_profit]);
    summary_sheet.add_row(row!["Total Items Sold", request.sales_summary.items_sold]);
    summary_sheet.add_row(row!["Total Transactions", request.sales_summary.transactions]);

    // Detailed sheet
    let mut detail_sheet = wb.create_sheet("Detailed Sales");
    detail_sheet.add_row(row![
        "ID",
        "Product",
        "Category",
        "Date",
        "Price",
        "Quantity",
        "Revenue",
        "Profit",
        "Margin"
    ]);

    for sale in &request.detailed_sales {
        detail_sheet.add_row(row![
            sale.id,
            &sale.product,
            &sale.category,
            &sale.date,
            sale.price,
            sale.quantity,
            sale.revenue,
            sale.profit,
            &sale.margin
        ]);
    }

    wb.close()
        .map_err(|e| format!("Failed to create Excel file: {}", e))?;

    Ok(request.path)
}

// Register all commands
pub fn init_commands(invoke_handler: &mut invoke_handler::Builder) {
    invoke_handler.register_handler("export_sales_report", export_sales_report);
}
