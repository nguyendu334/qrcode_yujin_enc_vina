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

export default function QRCodeCard({ machine, onClose }) {
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
        gridTemplateColumns: {
          xs: "minmax(100px, 0.8fr) minmax(0, 1.2fr)",
          sm: "150px minmax(0, 1fr)",
        },
        gap: 1,
        alignItems: "center",
        py: 1.5,
        borderBottom: "1px dashed #ECECEC",
        "&:last-child": {
          borderBottom: "none",
        },
      }}
    >
      <Typography
        sx={{
          color: "#64748B",
          fontWeight: 600,
          fontSize: {
            xs: "0.78rem",
            sm: "0.875rem",
          },
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          minWidth: 0,
          overflowWrap: "anywhere",
          fontSize: "0.875rem",
        }}
      >
        {value || "—"}
      </Box>
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        mt: {
          xs: 2,
          sm: 3,
        },
        width: "100%",
        maxWidth: 1100,
        minWidth: 0,
        mx: "auto",
        borderRadius: {
          xs: 2,
          sm: 3,
        },
        overflow: "hidden",
        border: "1px solid #E5E7EB",
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          background: "linear-gradient(135deg,#4F46E5 0%,#6366F1 100%)",
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: {
              xs: 18,
              sm: 22,
            },
          }}
        >
          {t("qrcodecard.qrcode")}
        </Typography>

        <Button
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "#fff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
            width: 36,
            height: 36,
            minWidth: 36,
            borderRadius: "50%",
            padding: 0,
            flexShrink: 0,
          }}
          onClick={onClose}
        >
          ❌
        </Button>
      </Box>

      {/* BODY */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
          },
          gap: {
            xs: 2.5,
            sm: 3,
            md: 4,
          },
          p: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          minWidth: 0,
        }}
      >
        {/* LEFT - QR CODE */}

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            textAlign: "center",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 3,
              p: {
                xs: 2,
                sm: 3,
              },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 260,
                display: "flex",
                justifyContent: "center",
                "& svg": {
                  width: "100%",
                  height: "auto",
                  maxWidth: 240,
                  display: "block",
                },
              }}
            >
              <QRCodeSVG value={qrUrl} size={240} level="H" includeMargin />
            </Box>
          </Paper>

          <Typography
            sx={{
              mt: 1.5,
              mb: 1,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Checksheet URL
          </Typography>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            sx={{
              width: "100%",
              minWidth: 0,
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={qrUrl}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                minWidth: 0,
                "& input": {
                  fontSize: "0.8rem",
                },
              }}
            />

            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={copyLink}
              sx={{
                height: 40,
                flexShrink: 0,
                textTransform: "none",
              }}
            >
              Copy
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
            sx={{
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Print />}
              sx={{
                textTransform: "none",
              }}
              onClick={() => window.print()}
            >
              Print
            </Button>

            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{
                textTransform: "none",
              }}
              onClick={() => {
                const svg = document.querySelector("#machine-qrcode svg");

                if (!svg) return;

                const svgData = new XMLSerializer().serializeToString(svg);

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const img = new Image();

                const svgBlob = new Blob([svgData], {
                  type: "image/svg+xml;charset=utf-8",
                });

                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                  canvas.width = img.width * 3;
                  canvas.height = img.height * 3;

                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                  URL.revokeObjectURL(url);

                  const link = document.createElement("a");
                  link.download = `${machine.machine_code}-QR.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                };

                img.onerror = () => {
                  URL.revokeObjectURL(url);
                  toast.error("Không thể tạo ảnh QR");
                };

                img.src = url;
              }}
            >
              Download PNG
            </Button>
          </Stack>

          {/* MACHINE CODE */}

          <Typography
            sx={{
              mt: 2,
              fontWeight: 700,
              fontSize: 18,
              overflowWrap: "anywhere",
            }}
          >
            {machine.machine_code}
          </Typography>

          <Typography color="text.secondary" fontSize={14}>
            {machine.machine_name}
          </Typography>
        </Box>

        {/* RIGHT - MACHINE INFORMATION */}

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: {
                xs: 19,
                sm: 22,
                md: 24,
              },
            }}
          >
            {t("qrcodecard.info")}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 2,
              fontSize: 14,
            }}
          >
            {t("qrcodecard.des")}
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: {
                xs: 1.5,
                sm: 2.5,
                md: 3,
              },
              borderRadius: 3,
              minWidth: 0,
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

            <InfoRow
              label={t("qrcodecard.admin")}
              value={machine.approver_name}
            />

            <InfoRow
              label={t("qrcodecard.type")}
              value={
                <Chip
                  label={machine.machine_type_name || "—"}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              }
            />

            <InfoRow
              label={t("qrcodecard.status")}
              value={
                machine.active ? (
                  <Chip
                    color="success"
                    icon={<CheckCircle />}
                    label="Active"
                    size="small"
                  />
                ) : (
                  <Chip
                    color="error"
                    icon={<Cancel />}
                    label="Inactive"
                    size="small"
                  />
                )
              }
            />
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
}
