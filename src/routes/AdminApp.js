import React, { useState, useEffect } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { selectFilter } from "react-bootstrap-table2-filter";
import paginationFactory from "react-bootstrap-table2-paginator";
import { Modal, Button } from "react-bootstrap";
import styles from "../css/AdminApp.module.css";
import Icon from "@mdi/react";
import { mdiSwapVerticalBold } from "@mdi/js";

import { useNavigate } from "react-router-dom";

export default function AdminApp() {
  let userData = sessionStorage.getItem("userData");
  userData = { data: JSON.parse(userData) };

  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({});
  const [isApproved, setIsApproved] = useState({});
  const [isCanceled, setIsCanceled] = useState({});
  const [isDeleted, setIsDeleted] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModalA, setShowConfirmModalA] = useState(false);
  const [showConfirmModalC, setShowConfirmModalC] = useState(false);
  const [showConfirmModalD, setShowConfirmModalD] = useState(false);

  const [singleRequest, setSingleRequest] = useState({});
  const role = userData.data.roles[0];

  // All clients
  useEffect(() => {
    fetch(`https://coopbank-app-server.herokuapp.com/request/list`, {
      method: "GET",
      headers: { Authorization: `Bearer ${userData.data.token}` },
    }).then(async (response) => {
      const data = await response.json();
      if (response.status >= 400) {
        setAdminData({ state: "error", error: data });
      } else {
        setAdminData({ state: "success", data: data });
      }
    });
  }, [isApproved, isCanceled, isDeleted]);

  // Single client
  const editBtnFetch = (id) => {
    fetch(`https://coopbank-app-server.herokuapp.com/request/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(async (response) => {
      const data = await response.json();
      if (response.status >= 400) {
        setSingleRequest({ state: "error", error: data });
      } else {
        setSingleRequest({ state: "success", data: data });
        setShowModal(true);
      }
    });
  };

  // Update button for APPROVE
  const approveBtn = () => {
    fetch(
      `https://coopbank-app-server.herokuapp.com/request/${singleRequest.data.id}/approve`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${userData.data.token}` },
      }
    ).then(async (response) => {
      const data = await response.json();
      if (response.status >= 400) {
        setIsApproved({ state: "error", error: data });
      } else {
        setIsApproved({ state: "success", data: data });
      }
    });
  };

  // Update button for CANCEL
  const cancelBtn = () => {
    fetch(
      `https://coopbank-app-server.herokuapp.com/request/${singleRequest.data.id}/cancel`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${userData.data.token}` },
      }
    ).then(async (response) => {
      const data = await response.json();
      if (response.status >= 400) {
        setIsCanceled({ state: "error", error: data });
      } else {
        setIsCanceled({ state: "success", data: data });
      }
    });
  };

  // Delete request of single client data button
  const deleteBtn = () => {
    fetch(
      `https://coopbank-app-server.herokuapp.com/request/${singleRequest.data.id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userData.data.token}` },
      }
    ).then(async (response) => {
      const data = await response.json();
      if (response.status >= 400) {
        setIsDeleted({ state: "error", error: data });
      } else {
        setIsDeleted({ state: "success", data: data });
      }
    });
  };

  const newData = { ...adminData };
  if (newData.state === "success") {
    newData.data.map((x, index) => {
      if (x.companyName) {
        newData.data[index].surname = x.companyName;
      }
      return newData;
    });
  }

  //  Sorting buttons in table header
  const sortNames = (
    <span>
      ??adit dle p????jmen?? / n??zvu firmy
      <Button className={styles.sort_btn + " outline-primary"}>
        <Icon size={1} path={mdiSwapVerticalBold} />
      </Button>
    </span>
  );
  const sortNumbers = (
    <span>
      ??adit dle v????ky ??veru
      <Button className={styles.sort_btn}>
        <Icon size={1} path={mdiSwapVerticalBold} />
      </Button>
    </span>
  );

  // Select inputs in table header
  const selectOptionsType = {
    OSVC: "Podnikatel fyzick?? osoba",
    INDIVIDUAL: "Fyzick?? osoba",
    LEGAL_ENTITY: "Pr??vnick?? osoba",
  };
  const selectOptionsStatus = {
    PENDING: "??ek?? na schv??len??",
    APPROVED: "Schv??leno",
    CANCELLED: "Zam??tnuto",
  };

  //Numbers Formatter
  const numberFormatter = (number) => {
    return new Intl.NumberFormat("cs-CZ").format(number) + ` K??`;
  };

  // Edit buttons for single row in table
  const editBtn = (e, row) => {
    return (
      <Button
        className={styles.edit_btn}
        onClick={() => {
          editBtnFetch(row.id);
        }}
      >
        Upravit
      </Button>
    );
  };

  const columns = [
    {
      dataField: "surname",
      sort: true,
      headerFormatter: (cell) => sortNames,
    },
    {
      dataField: "amount",
      sort: true,
      headerFormatter: (cell) => sortNumbers,
      formatter: numberFormatter,
    },
    {
      dataField: "applicantType",
      text: "Typ osoby",
      formatter: (cell) => selectOptionsType[cell],
      filter: selectFilter({
        options: selectOptionsType,
        placeholder: "Zobrazit v??e",
      }),
    },
    {
      dataField: "status",
      text: "Stav",
      formatter: (cell) => selectOptionsStatus[cell],
      filter: selectFilter({
        options: selectOptionsStatus,
        placeholder: "Zobrazit v??e",
      }),
    },
    {
      formatter: editBtn,
    },
  ];

  const ModalContent = () => {
    return (
      <>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => setShowModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <div className={styles.modal_title}>
                <p className={styles.modal_status_pen}>
                  {singleRequest.data.status === "PENDING" &&
                    `??ek?? na schv??len??`}
                </p>
                <p className={styles.modal_status_app}>
                  {singleRequest.data.status === "APPROVED" && `Schv??leno`}
                </p>
                <p className={styles.modal_status_can}>
                  {singleRequest.data.status === "CANCELLED" && `Zam??tnuto`}
                </p>
                {singleRequest.data.companyName
                  ? singleRequest.data.companyName
                  : `${singleRequest.data.name} ${singleRequest.data.surname}`}
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              {singleRequest.data.companyName ? (
                <>
                  <li>Spole??nost: {singleRequest.data.companyName}</li>
                  <li>
                    Jednatel:{" "}
                    {`${singleRequest.data.name} ${singleRequest.data.surname}`}
                  </li>
                </>
              ) : (
                <li>
                  Jm??no: {singleRequest.data.name} {singleRequest.data.surname}
                </li>
              )}

              <li>
                Typ osoby:
                {singleRequest.data.applicantType === "INDIVIDUAL" &&
                  ` fyzick?? osoba`}
                {singleRequest.data.applicantType === "OSVC" &&
                  ` podnikatel fyzick?? osoba`}
                {singleRequest.data.applicantType === "LEGAL_ENTITY" &&
                  ` pr??vnick?? osoba`}
              </li>
              <li>
                V????e ??veru:{" "}
                {new Intl.NumberFormat("cs-CZ").format(
                  singleRequest.data.amount
                ) + ` K??`}
              </li>
              <li>{`D??lka spl??cen??: ${singleRequest.data.numOfMonths} m??s??c??`}</li>
              {singleRequest.data.companyName ? (
                <li>{`I??O: ${singleRequest.data.IC}`}</li>
              ) : (
                <li>{`Rodn?? ????slo: ${singleRequest.data.birthNum}`}</li>
              )}
              <li>{`St??tn?? p????slu??nost: ${singleRequest.data.nationality}`}</li>
              {singleRequest.data.phone && (
                <li>{`Telefonn?? ????slo: ${singleRequest.data.phone}`}</li>
              )}
              <li>{`E-mailov?? adresa: ${singleRequest.data.email}`}</li>
              <li>Adresa:</li>
              <ul className={styles.address_ul}>
                <li>{`Ulice: ${singleRequest.data.address.street}`}</li>
                {singleRequest.data.address.descNumber && (
                  <li>
                    {`????slo popisn??: ${singleRequest.data.address.descNumber}`}
                  </li>
                )}
                <li>
                  {`????slo orienta??n??: ${singleRequest.data.address.indicativeNumber}`}
                </li>
                <li>{`M??sto: ${singleRequest.data.address.city}`}</li>
                <li>{`PS??: ${singleRequest.data.address.postalCode}`}</li>
              </ul>
            </ul>
            <div className={styles.modal_buttons}>
              {role === "SUPERVIZOR" && (
                <div className={styles.approval_btn}>
                  {(singleRequest.data.status === "PENDING" ||
                    singleRequest.data.status === "CANCELLED") && (
                    <Button
                      onClick={() => {
                        setShowConfirmModalA(true);
                      }}
                      className="rounded-0"
                    >
                      Potvrdit
                    </Button>
                  )}
                  {(singleRequest.data.status === "PENDING" ||
                    singleRequest.data.status === "APPROVED") && (
                    <Button
                      onClick={() => setShowConfirmModalC(true)}
                      variant="secondary"
                      className="rounded-0"
                    >
                      Zam??tnout
                    </Button>
                  )}
                </div>
              )}
              {role === "ADMIN" && singleRequest.data.status === "PENDING" && (
                <div className={styles.approval_btn}>
                  <Button
                    onClick={() => {
                      setShowConfirmModalA(true);
                    }}
                    className="rounded-0"
                  >
                    Potvrdit
                  </Button>

                  <Button
                    onClick={() => {
                      setShowConfirmModalC(true);
                    }}
                    variant="secondary"
                    className="rounded-0"
                  >
                    Zam??tnout
                  </Button>
                </div>
              )}

              {role === "SUPERVIZOR" && (
                <Button
                  onClick={() => setShowConfirmModalD(true)}
                  variant="danger"
                  className="rounded-0"
                >
                  Vymazat
                </Button>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  };

  const ConfirmModalA = () => {
    return (
      <Modal
        animation={false}
        centered
        size="sm"
        show={showConfirmModalA}
        onHide={() => setShowConfirmModalA(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Opravdu chcete ????dost schv??lit?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-around">
            <Button
              className="rounded-0"
              onClick={() => {
                approveBtn();
                setTimeout(() => {
                  editBtnFetch(singleRequest.data.id);
                }, 500);
                editBtnFetch(singleRequest.data.id);
                setShowConfirmModalA(false);
              }}
            >
              Potvrdit
            </Button>
            <Button
              className="rounded-0"
              variant="secondary"
              onClick={() => setShowConfirmModalA(false)}
            >
              Zav????t
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };
  const ConfirmModalC = () => {
    return (
      <Modal
        animation={false}
        centered
        size="sm"
        show={showConfirmModalC}
        onHide={() => setShowConfirmModalC(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Opravdu chcete ????dost zam??tnout?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-around">
            <Button
              className="rounded-0"
              variant="danger"
              onClick={() => {
                cancelBtn();
                setTimeout(() => {
                  editBtnFetch(singleRequest.data.id);
                }, 500);
                setShowConfirmModalC(false);
              }}
            >
              Zam??tnout
            </Button>
            <Button
              variant="secondary"
              className="rounded-0"
              onClick={() => setShowConfirmModalC(false)}
            >
              Zav????t
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };
  const ConfirmModalD = () => {
    return (
      <Modal
        animation={false}
        centered
        size="sm"
        // className="mb-3"
        show={showConfirmModalD}
        onHide={() => setShowConfirmModalD(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Opravdu chcete smazat ????dost?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-around">
            <Button
              className="rounded-0"
              variant="danger"
              onClick={() => {
                deleteBtn();

                setShowConfirmModalD(false);
                setShowModal(false);
              }}
            >
              Smazat
            </Button>
            <Button
              variant="secondary"
              className="rounded-0"
              onClick={() => setShowConfirmModalD(false)}
            >
              Zav????t
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <>
      <div className={"d-flex justify-content-end mb-3 mt-3"}>
        <h6
          className={"d-flex align-items-center"}
        >{`P??ihl????en?? u??ivatel: ${userData.data.name}`}</h6>
        <Button
          variant="secondary"
          className={"ms-5 rounded-0"}
          onClick={() => {
            sessionStorage.clear();
            navigate("/adminLogin");
          }}
        >
          Odhl??sit se
        </Button>
      </div>
      {adminData.data && (
        <BootstrapTable
          className={styles.table}
          keyField="id"
          data={adminData.data}
          columns={columns}
          striped
          condensed
          filter={filterFactory()}
          pagination={paginationFactory()}
        />
      )}
      {showModal && <ModalContent />}

      {showConfirmModalA && <ConfirmModalA />}
      {showConfirmModalC && <ConfirmModalC />}
      {showConfirmModalD && <ConfirmModalD />}
    </>
  );
}
