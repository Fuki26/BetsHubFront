import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Collapse, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getUserSessions } from "../../api";
import { startOfWeek, format, isToday, parseISO } from "date-fns";

const SessionTable = ({ userName }) => {
  const [sessionData, setSessionData] = useState([]);
  const [summarizedData, setSummarizedData] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const data = await getUserSessions(userName);
        setSessionData(data?.data.map((d) => {
          return {
            ...d,
            startTime: d.startTime
              ? new Date(d.startTime).toUTCString()
              : '',
          }
        }));
        processSummarizedData(data?.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSessionData();
  }, [userName]);

  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const processSummarizedData = (data) => {
    let todaySummary = { id: "today", duration: 0, count: 0 };
    let weekSummaries = {};

    data.forEach((session) => {
      const sessionDate = parseISO(session.startTime);
      if (isToday(sessionDate)) {
        todaySummary.duration += session.duration;
        todaySummary.count += 1;
      } else {
        const weekStart = format(startOfWeek(sessionDate), "yyyy-MM-dd");
        if (!weekSummaries[weekStart]) {
          weekSummaries[weekStart] = { id: weekStart, duration: 0, count: 0 };
        }
        weekSummaries[weekStart].duration += session.duration;
        weekSummaries[weekStart].count += 1;
      }
    });

    todaySummary.duration = formatDuration(todaySummary.duration);
    Object.values(weekSummaries).forEach((week) => {
      week.duration = formatDuration(week.duration);
    });

    setSummarizedData([todaySummary, ...Object.values(weekSummaries)]);
  };

  const rawColumns = [
    { field: "startTime", headerName: "Start Time", width: 270 },
    { field: "duration", headerName: "Duration", width: 100 },
    { field: "ip", headerName: "IP Address", width: 150 },
    { field: "userAgent", headerName: "User agent", width: 800 },
  ];

  const summaryColumns = [
    { field: "id", headerName: "Date/Week Starting", width: 200 },
    { field: "duration", headerName: "Total Duration", width: 150 },
    { field: "count", headerName: "Number of Sessions", width: 200 },
  ];

  return (
    <div sx={{ maxWidht: "100%" }}>
      <Typography variant="button" component="span">
        User Sessions Summary
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
        <div style={{ height: 400, width: "100%", marginBottom: "20px" }}>
          <DataGrid
            rows={summarizedData}
            columns={summaryColumns}
            pageSize={5}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={sessionData}
            columns={rawColumns}
            pageSize={5}
            pageSizeOptions={[5, 10, 25]}
          />
        </div>
      </Collapse>
    </div>
  );
};

export default SessionTable;
