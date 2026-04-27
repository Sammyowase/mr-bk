import { Column, Workbook } from "exceljs";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger/logger";

class SpreadSheet {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Not fully implemented
  public async readExcel(filePath: string) {
    const wb = new Workbook();
    await wb.xlsx.readFile(filePath);
    const worksheet = wb.getWorksheet(1);

    if (worksheet) {
      worksheet.eachRow((row, rowNumber) => {
        console.log(`Row ${rowNumber}:`, row.values);
      });
    }
    logger.error("Worksheet not found");
  }

  public async writeExcel(
    filename: string,
    sheetname: string,
    columns: Partial<Column>[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[]
  ): Promise<string> {
    // Create a workbook
    const wb = new Workbook();

    // Add a worksheet
    const worksheet = wb.addWorksheet(sheetname);

    // Add the headers
    worksheet.columns = columns;

    // Add the rows
    worksheet.addRows(data);

    const filePath = this.generateFilePath(filename);
    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    logger.debug(`File path: ${filePath}`);

    // Write to a temp file
    await wb.xlsx.writeFile(filePath);
    logger.info("Excel file written successfully");

    // Return the filePath
    return filePath;
  }

  public generateFilePath(filename: string): string {
    const name = `${filename}-${Date.now()}.xlsx`;
    return path.join(__dirname, "/tmp", name);
  }
}

export default SpreadSheet;
