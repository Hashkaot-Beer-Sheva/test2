# Property spreadsheet import

Use `property-import.csv` as the bulk data file for buildings and apartments.

To add many records:

1. Open your spreadsheet.
2. Keep the first row as the column headers.
3. Copy the rows beneath the headers.
4. Paste them into `property-import.csv` beneath the sample row.
5. Save the file as UTF-8 CSV.

One row represents one apartment. The app can group rows into buildings using:

- `Street`
- `Street Number`

The file includes the original spreadsheet fields plus the import-only property metrics:

- unique IDs
- entrance and alternate address
- rooms, garden, floor, size
- parcel and sub-parcel
- owners and contact details
- validation status and date
- owner contract
- invested amount
- housewares and agreement
- rentable status
- representative and lawyer
- Pinui-Binui status

Do not change the header names or column order until the CSV importer is connected. Avoid commas inside a cell unless the cell is wrapped in double quotes.
