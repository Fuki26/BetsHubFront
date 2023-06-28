import React, { useState, useEffect } from "react";
import { BetsTable } from "../../components/BetsTable";
import { getPendingBets } from "../../api";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { betToBetModelMapper } from "../../utils";
import styles from './Home.module.css'

const Home = () => {
  const [rows, setRows] = useState([]);

  const fetchBets = async () => {
    const rowsData = (await getPendingBets()).map(betToBetModelMapper);
    setRows(rowsData);
  };

  useEffect(() => {
    fetchBets();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "stake", headerName: "Stake", type: "number", width: 100 },
    { field: "sport", headerName: "Sport", width: 130 },
    {
      field: "liveStatus",
      headerName: "Live Status",
      type: "number",
      width: 130,
    },
    { field: "market", headerName: "Market", width: 130 },
    { field: "tournament", headerName: "Tournament", width: 130 },
    { field: "selection", headerName: "Selection", width: 130 },
    { field: "odd", headerName: "Odd", type: "number", width: 100 },
    { field: "notes", headerName: "Notes", width: 200 },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      type: "number",
      width: 130,
    },
    {
      field: "Modify",
      headerName: "Modify",
      sortable: false,
      width: 120,
      disableClickEventBubbling: true,
      renderCell: (params) => {
        const onClick = async () => {
          await deleteBet({ id: params.id });
          fetchBets();
        };
        return (
          <>
            <IconButton
              onClick={(e) => {
                // handleRowEditButton(params.row);
              }}
              aria-label="delete"
              size="large"
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={onClick} aria-label="delete" size="large">
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  const addNewBet = async (bet) => {
    // replace with your implementation
    console.log("Adding new bet", bet);
  };

  const editBet = async (bet) => {
    // replace with your implementation
    console.log("Editing bet", bet);
  };

  const deleteBet = async (bet) => {
    // replace with your implementation
    console.log("Deleting bet", bet);
  };

  return (
    <div className={styles.container}>
      <BetsTable
        rows={rows}
        columns={columns}
        addNewBet={addNewBet}
        editBet={editBet}
        deleteBet={deleteBet}
      />
    </div>
  );
};

export default Home;
