/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Container, Box, CircularProgress } from "@mui/material";

import HeaderCard from "../components/checksheet/HeaderCard";
import MachineInfo from "../components/checksheet/MachineInfo";
import InspectorForm from "../components/checksheet/InspectorForm";
import ChecklistItem from "../components/checksheet/ChecklistItem";
import FooterSubmit from "../components/checksheet/FooterSubmit";

import { getChecksheet } from "../services/checksheetService";

export default function ChecksheetPage() {
  const [params] = useSearchParams();

  const machineId = params.get("machine");

  const [loading, setLoading] = useState(true);

  const [machine, setMachine] = useState(null);

  const [items, setItems] = useState([]);

  const [answers, setAnswers] = useState({});

  const [inspector, setInspector] = useState("");

  const [shift, setShift] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getChecksheet(machineId);

    setMachine(data.machine);

    setItems(data.checklistItems);

    const init = {};

    data.checklistItems.forEach((i) => {
      init[i.item_id] = "";
    });

    setAnswers(init);

    setLoading(false);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F7FA",
        py: 5,
      }}
    >
      <Container maxWidth="md">
        <HeaderCard machine={machine} />

        <MachineInfo machine={machine} />

        <InspectorForm
          inspector={inspector}
          setInspector={setInspector}
          shift={shift}
          setShift={setShift}
        />

        {items.map((item, index) => (
          <ChecklistItem
            key={item.item_id}
            index={index}
            item={item}
            answers={answers}
            setAnswers={setAnswers}
          />
        ))}
      </Container>

      <FooterSubmit />
    </Box>
  );
}
