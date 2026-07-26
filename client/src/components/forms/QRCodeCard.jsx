/* eslint-disable react/prop-types */
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  Stack,
} from "@mui/material";

import { useTranslation } from "react-i18next";

import {
  Download,
  Print,
  ContentCopy,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";

import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";

export default function QRCodeCard({ machine }) {
  const { t } = useTranslation();
  if (!machine) return null;

  const qrUrl = `${window.location.origin}/machine-menu?machine=${machine.machine_id}`;

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(qrUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = qrUrl;

        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        document.execCommand("copy");

        document.body.removeChild(textArea);
      }

      toast.success("Đã copy đường dẫn");
    } catch (err) {
      console.error(err);
      toast.error("Không thể copy");
    }
  };

  const InfoRow = ({ label, value }) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        py: 1.2,
        borderBottom: "1px dashed #ECECEC",
      }}
    >
      <Typography
        sx={{
          color: "#64748B",
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Box>{value}</Box>
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        width: "100%",
        maxWidth: 1100,
        mx: "auto",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          background: "linear-gradient(135deg,#4F46E5 0%,#6366F1 100%)",
          px: 4,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          {t("qrcodecard.qrcode")}
        </Typography>
      </Box>

      {/* BODY */}

      <Box
        sx={{
          display: "flex",
          gap: 5,
          p: 4,
        }}
      >
        {/* LEFT */}

        <Box
          sx={{
            width: 500,
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              p: 2,
            }}
          >
            <QRCodeSVG value={qrUrl} size={240} />
          </Paper>
          <Typography
            sx={{
              margin: "4px",
              fontWeight: "700",
            }}
          >
            Checksheet URL
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              size="small"
              value={qrUrl}
              InputProps={{
                readOnly: true,
              }}
            />

            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={copyLink}
              sx={{ height: "36px" }}
            >
              Copy
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{
              marginTop: "8px",
            }}
          >
            <Button variant="outlined" startIcon={<Print />}>
              Print
            </Button>

            <Button variant="contained" startIcon={<Download />}>
              Download PNG
            </Button>
          </Stack>

          {/* <Typography mt={2} fontWeight={700} fontSize={20}>
            {machine.machine_code}
          </Typography>

          <Typography color="text.secondary">{machine.machine_name}</Typography> */}
        </Box>

        {/* RIGHT */}

        <Box flex={1}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            {t("qrcodecard.info")}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              marginBottom: "10px",
            }}
          >
            {t("qrcodecard.des")}
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <InfoRow
              label={t("qrcodecard.code")}
              value={
                <Typography fontWeight={700}>{machine.machine_code}</Typography>
              }
            />

            <InfoRow
              label={t("qrcodecard.name")}
              value={
                <Typography fontWeight={600}>{machine.machine_name}</Typography>
              }
            />

            <InfoRow label={t("qrcodecard.area")} value={machine.area_name} />

            <InfoRow label={t("qrcodecard.admin")} value={machine.approver_name} />

            <InfoRow
              label={t("qrcodecard.type")}
              value={
                <Chip
                  label={machine.machine_type_name}
                  color="primary"
                  variant="outlined"
                />
              }
            />

            <InfoRow
              label={t("qrcodecard.status")}
              value={
                machine.active ? (
                  <Chip color="success" icon={<CheckCircle />} label="Active" />
                ) : (
                  <Chip color="error" icon={<Cancel />} label="Inactive" />
                )
              }
            />
          </Paper>

          {/* <Divider sx={{ my: 3 }} /> */}
        </Box>
      </Box>
    </Paper>
  );
}
