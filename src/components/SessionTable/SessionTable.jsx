import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Collapse, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getUserSessions } from "../../api";

const SessionTable = ({ userName }) => {
  const [sessionData, setSessionData] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const data = await getUserSessions(userName);
        setSessionData(data?.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSessionData();
  }, [userName]);

  const columns = [
    { field: "startTime", headerName: "Start Time", width: 200 },
    { field: "duration", headerName: "Duration", width: 150 },
    { field: "ip", headerName: "IP Address", width: 100 },
    { field: "userAgent", headerName: "User agent", width: 200 },
  ];

  return (
    <div sx={{maxWidht: '100%'}}>
      <Typography variant="button" component="span">
        User Sessions
      </Typography>
      <IconButton
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="show more"
      >
        <ExpandMoreIcon
          sx={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </IconButton>
      <Collapse in={open}>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={sessionData}
            columns={columns}
            pageSize={5}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default SessionTable;