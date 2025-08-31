import api from "../api/axios";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [from, setFrom] = useState(new Date().toISOString().split("T")[0]);
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);
  const [corrections, setCorrections] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    // Stub employees if no API available
    setEmployees([
      { id: "a6bedfe5-83fe-4914-a4bc-1ccde1ea2795", name: "Demo Employee" },
    ]);
    loadCorrections();
  }, []);

  const loadDaywise = async () => {
    const res = await api.get("/admin/attendance", {
      params: { employeeId, date },
    });
    setAttendance(res.data);
  };

  const loadSummary = async () => {
    const res = await api.get("/admin/attendance/summary", {
      params: { employeeId, from, to },
    });
    setAttendance(res.data);
  };

  const loadCorrections = async () => {
    const res = await api.get("/attendance/corrections/all", {
      params: { status: "PENDING" },
    });
    setCorrections(res.data);
    setSelected([]); // reset selection
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const approveSelected = async () => {
    if (
      !window.confirm(
        `Are you sure you want to APPROVE ${selected.length} correction(s)?`
      )
    )
      return;

    for (const id of selected) {
      await api.patch(`/attendance/corrections/${id}/decision`, {
        status: "APPROVED",
      });
    }
    loadCorrections();
  };

  const reject = async (id) => {
    if (!window.confirm("Reject this correction?")) return;
    await api.patch(`/attendance/corrections/${id}/decision`, {
      status: "REJECTED",
    });
    loadCorrections();
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Admin Dashboard</h1>

      {/* Employee Selector */}
      <div className="mb-4">
        <label className="mr-2">Employee:</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border p-2"
        >
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {/* Daywise Attendance */}
      <div className="mb-6">
        <h2 className="text-md font-semibold mb-2">Daywise Attendance</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={loadDaywise}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Load
        </button>
      </div>

      {/* Range Summary */}
      <div className="mb-6">
        <h2 className="text-md font-semibold mb-2">Summary (From - To)</h2>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={loadSummary}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Load
        </button>
      </div>

      {/* Attendance Table */}
      {attendance.length > 0 && (
        <table className="min-w-full border mt-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">In Time</th>
              <th className="p-2 border">Out Time</th>
              <th className="p-2 border">Hours</th>
              <th className="p-2 border">Location</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => {
              const inTime = a.inTime
                ? new Date(a.inTime).toLocaleTimeString()
                : "-";
              const outTime = a.outTime
                ? new Date(a.outTime).toLocaleTimeString()
                : "-";
              const hours =
                a.inTime && a.outTime
                  ? (
                      (new Date(a.outTime) - new Date(a.inTime)) /
                      (1000 * 60 * 60)
                    ).toFixed(2)
                  : "-";

              return (
                <tr key={a.id} className="border">
                  <td className="p-2 border">{a.workDate}</td>
                  <td className="p-2 border">
                    {a.user?.fullName || a.user?.email || "N/A"}
                  </td>
                  <td className="p-2 border">{inTime}</td>
                  <td className="p-2 border">{outTime}</td>
                  <td className="p-2 border">{hours}</td>
                  <td className="p-2 border">
                    {a.inLat && a.inLng ? `${a.inLat}, ${a.inLng}` : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Corrections Table */}
      <div className="mt-8">
        <h2 className="text-md font-semibold mb-2">Pending Correction Requests</h2>
        {corrections.length > 0 ? (
          <>
            <table className="min-w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Select</th>
                  <th className="p-2 border">Employee</th>
                  <th className="p-2 border">Attendance Date</th>
                  <th className="p-2 border">Proposed In</th>
                  <th className="p-2 border">Proposed Out</th>
                  <th className="p-2 border">Reason</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((c) => (
                  <tr key={c.id} className="border">
                    <td className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                      />
                    </td>
                    <td className="p-2 border">
                      {c.requester?.fullName || c.requester?.email || "N/A"}
                    </td>
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
                    <td className="p-2 border">
                      <button
                        onClick={() => reject(c.id)}
                        className="bg-red-500 text-white px-2 py-1"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selected.length > 0 && (
              <button
                onClick={approveSelected}
                className="bg-green-600 text-white px-4 py-2 mt-4"
              >
                Approve Selected
              </button>
            )}
          </>
        ) : (
          <p>No pending corrections</p>
        )}
      </div>
    </div>
  );
}
