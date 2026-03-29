import React from "react";
import { Link } from "react-router-dom";
import "./AssetCard.css";

const AssetCard = ({ asset, onBorrow }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "status-active";
      case "maintenance":
        return "status-maintenance";
      case "retired":
        return "status-retired";
      default:
        return "status-unknown";
    }
  };

  const isAvailableForBorrow = asset.status === "ACTIVE";

  return (
    <div className="asset-card">
      <div className="asset-header">
        <h3 className="asset-title">
          {asset.name || "Unnamed Asset"}
        </h3>
        <span className={`status-badge ${getStatusClass(asset.status)}`}>
          {asset.status || "UNKNOWN"}
        </span>
      </div>

      <div className="asset-details">
        <div className="detail-row">
          <span className="detail-label">Category</span>
          <span className="detail-value">
            {asset.category || "N/A"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Serial No</span>
          <span className="detail-value">
            {asset.serialNo || "N/A"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Condition</span>
          <span className="detail-value">
            {asset.assetCondition || "N/A"}
          </span>
        </div>
      </div>

      <div className="asset-actions">
        <Link
          to={`/assets/${asset.id}`}
          className="btn btn-secondary"
        >
          View Details
        </Link>

        {isAvailableForBorrow ? (
          <button
            className="btn btn-primary"
            onClick={() => onBorrow(asset.id)}
          >
            Borrow Request
          </button>
        ) : (
          <button className="btn btn-disabled" disabled>
            Not Available
          </button>
        )}
      </div>
    </div>
  );
};

export default AssetCard;