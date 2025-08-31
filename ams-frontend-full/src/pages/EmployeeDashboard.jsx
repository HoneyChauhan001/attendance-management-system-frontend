import api from "../api/axios";
import { useState, useEffect } from "react";

export default function EmployeeDashboard() {
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [correction, setCorrection] = useState({
    reason: "",
    inTime: "",
    outTime: "",
  });
  const [myCorrections, setMyCorrections] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => console.error("Geo error", err)
    );
  }, []);

  const clockIn = async () => {
    const fd = new FormData();
    if (lat) fd.append("lat", lat);
    if (lng) fd.append("lng", lng);
    if (file) fd.append("selfie", file);
    await api.post("/attendance/clock-in", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMsg("Clocked In!");
    loadAttendance();
  };

  const clockOut = async () => {
    const fd = new FormData();
    if (lat) fd.append("lat", lat);
    if (lng) fd.append("lng", lng);
    if (file) fd.append("selfie", file);
    await api.post("/attendance/clock-out", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMsg("Clocked Out!");
    loadAttendance();
  };

  const loadAttendance = async () => {
    const res = await api.get("/attendance/me", { params: { date: selectedDate } });
    setAttendance(res.data);
  };

  const submitCorrection = async () => {
    if (!selectedEntry) {
      alert("Please select an attendance entry first");
      return;
    }
    await api.post("/attendance/corrections", {
      attendanceId: selectedEntry.id,
      proposedInTime: correction.inTime
        ? new Date(correction.inTime).toISOString()
        : null,
      proposedOutTime: correction.outTime
        ? new Date(correction.outTime).toISOString()
        : null,
      reason: correction.reason,
    });
    setMsg("Correction request submitted");
    setSelectedEntry(null);
  };

  const loadMyCorrections = async () => {
    const res = await api.get("/attendance/corrections", { params: { mine: true } });
    setMyCorrections(res.data);
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Employee Dashboard</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <div className="mb-4">
        <button
          onClick={clockIn}
          className="bg-green-500 text-white px-4 py-2 mr-2"
        >
          Clock In
        </button>
        <button
          onClick={clockOut}
          className="bg-red-500 text-white px-4 py-2"
        >
          Clock Out
        </button>
      </div>

      {/* Date picker */}
      <div className="mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={loadAttendance}
          className="ml-2 bg-blue-500 text-white px-4 py-2"
        >
          Load Attendance
        </button>
      </div>

      <p className="mt-2 text-green-600">{msg}</p>

      {/* Attendance Table */}
      {attendance.length > 0 && (
        <table className="min-w-full border mt-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Select</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">In Time</th>
              <th className="p-2 border">Out Time</th>
              <th className="p-2 border">Hours</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => {
              const inTime = a.inTime ? new Date(a.inTime).toLocaleTimeString() : "-";
              const outTime = a.outTime ? new Date(a.outTime).toLocaleTimeString() : "-";
              const hours =
                a.inTime && a.outTime
                  ? (
                      (new Date(a.outTime) - new Date(a.inTime)) /
                      (1000 * 60 * 60)
                    ).toFixed(2)
                  : "-";

              return (
                <tr key={a.id} className="border">
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedEntry?.id === a.id}
                      onChange={(e) =>
                        e.target.checked ? setSelectedEntry(a) : setSelectedEntry(null)
                      }
                    />
                  </td>
                  <td className="p-2 border">{a.workDate}</td>
                  <td className="p-2 border">{inTime}</td>
                  <td className="p-2 border">{outTime}</td>
                  <td className="p-2 border">{hours}</td>
                  <td className="p-2 border">
                    {a.inLat && a.inLng ? `${a.inLat}, ${a.inLng}` : "-"}
                  </td>
                  <td className="p-2 border">{a.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Correction Request Form */}
      {selectedEntry && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h2 className="text-md mb-2 font-semibold">Correction Request</h2>
          <input
            type="datetime-local"
            onChange={(e) =>
              setCorrection({ ...correction, inTime: e.target.value })
            }
            className="border p-1 mb-2 block"
          />
          <input
            type="datetime-local"
            onChange={(e) =>
              setCorrection({ ...correction, outTime: e.target.value })
            }
            className="border p-1 mb-2 block"
          />
          <input
            placeholder="Reason"
            onChange={(e) =>
              setCorrection({ ...correction, reason: e.target.value })
            }
            className="border p-1 mb-2 block"
          />
          <button
            onClick={submitCorrection}
            className="bg-purple-500 text-white px-4 py-2"
          >
            Submit Correction
          </button>
        </div>
      )}

      {/* My Corrections */}
      <div className="mt-8">
        <h2 className="text-md mb-2 font-semibold">My Corrections</h2>
        <button
          onClick={loadMyCorrections}
          className="bg-orange-500 text-white px-4 py-2 mb-2"
        >
          Load My Corrections
        </button>

        {myCorrections.length > 0 && (
          <table className="min-w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Proposed In</th>
                <th className="p-2 border">Proposed Out</th>
                <th className="p-2 border">Reason</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {myCorrections.map((c) => (
                <tr key={c.id} className="border">
                  <td className="p-2 border">
                    {c.attendance?.workDate || "-"}
                  </td>
                  <td className="p-2 border">
                    {c.proposedInTime
                      ? new Date(c.proposedInTime).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-2 border">
                    {c.proposedOutTime
                      ? new Date(c.proposedOutTime).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-2 border">{c.reason}</td>
                  <td className="p-2 border">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
