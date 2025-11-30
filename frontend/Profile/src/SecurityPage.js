import React from "react";
import "./App.css";

export default function SecurityPage() {
  return (
    <div className="settings-wrap">
      <h3 className="settings-title">Change password</h3>

      <div className="settings-card">
        <div className="form-row">
          <label>Current password</label>
          <input type="password" value="mypassword" readOnly />
        </div>

        <div className="form-row">
          <label>New password</label>
          <input type="password" placeholder="Enter new password" />
        </div>

        <div className="form-row">
          <label>Confirm password</label>
          <input type="password" placeholder="Confirm new password" />
        </div>

        <div className="settings-actions">
          <button className="save-btn">Save changes</button>
          <button className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}
