# Design — carrier

AGX Thor Developer Kit (NVIDIA, T5000, 243.19 × 112.40 × 56.88 mm,
5GbE + QSFP28, USB-C, 40–130 W) is the bring-up brick.

Production SOM from DS-11945-001 v1.4: 87.0 × 100.0 × 15.29 mm, 350 g,
699-pin B2B, 70 W default / 90 W TMP, 7–20 V HV + 5 V MV, no SYS_VIN_SV,
no CAN, 3× 25G MGBE, 1× NVENC, 1 ISP.

Software and encode budget stay inside T4000 HQ so the body can shrink.
Carrier I/O: CSI/GMSL for the body cam, MGBE to a PoE switch, NVMe, TTP.
