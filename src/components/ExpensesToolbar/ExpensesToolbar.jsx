import Button from "@mui/material/Button";
import { createSvgIcon } from "@mui/material/utils";
import { GridToolbarContainer } from "@mui/x-data-grid";

const ExportIcon = createSvgIcon(
  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />,
  "SaveAlt"
);

const ExpensesToolbar = ({ setRows, setRowModesModel, rows}) => {
  const handleExport = (setRows, setRowModesModel, rows) => {
    const processedRows = rows.map((row) => {
      const newRow = { ...row };
      const labelKeys = new Set([
        "id",
        "counterAgent",
        "amount",
        "description",
      ]);

      const excludingKeys = new Set([
        "actionTypeApplied",
        "isSavedInDatabase",
        "counterAgentCategory",
      ]);

      Object.keys(newRow).forEach((key) => {
        if (
          newRow[key] === null ||
          newRow[key] === undefined ||
          newRow[key] === ""
        ) {
          newRow[key] = "N/A";
        } else if (typeof newRow[key] === "object" && newRow[key] !== null) {
          if (labelKeys.has(key)) {
            newRow[key] = newRow[key].label;
          }
        }

        if (excludingKeys.has(key)) {
          delete newRow[key];
        }
      });
      return newRow;
    });

    const csvString = convertToCSV(processedRows);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    if (link.download !== undefined) {
      link.setAttribute("href", url);
      link.setAttribute("download", "exported_data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const convertToCSV = (arr) => {
    const orderedKeys = [
    "id",
    "counterAgent",
    "amount",
    "description",
    "dateCreated",
   ];

    const header = orderedKeys.join(",");

    const rows = arr.map((row) => {
      const res = orderedKeys.map((key) => row[key] || "").join(",");
      return res;
    });
    return [header, ...rows].join("\n");
  };

  const buttonBaseProps = {
    color: "primary",
    size: "small",
    startIcon: <ExportIcon />,
  };

  return (
    <GridToolbarContainer>
      <Button
        {...buttonBaseProps}
        onClick={() => handleExport(setRows, setRowModesModel, rows)}
      >
        Export rows
      </Button>
    </GridToolbarContainer>
  );
};

export default ExpensesToolbar;
