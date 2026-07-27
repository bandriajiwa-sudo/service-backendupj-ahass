<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Nota Transaksi #{{ $transaction->no_nota }}</title>
    <style>
        /* 58mm -> 164.4pt width */
        @page {
            size: 58mm auto;
            margin: 0;
        }

        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            /* Slightly larger base font since we have 164.4pt space */
            line-height: 1.1;
            margin: 0;
            padding: 8px 8px 12px 8px;
            /* Safe padding from thermal printer edge */
            color: #000;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: bold;
        }

        .divider {
            border-bottom: 2px dashed #000;
            margin: 6px 0;
        }

        .divider-double {
            border-bottom: 1px solid #000;
            border-top: 1px solid #000;
            height: 2px;
            margin: 6px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            vertical-align: top;
            padding: 2px 0;
        }

        .header-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
        }

        .meta-text {
            font-size: 10px;
            margin: 2px 0;
        }

        .item-row {
            margin-bottom: 4px;
        }

        .item-name {
            display: block;
            margin-bottom: 2px;
        }

        .item-desc table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
            margin-bottom: 4px;
        }
    </style>
</head>

<body>

    <!-- Header Section -->
    <div class="divider-double"></div>
    <div class="text-center">
        <div class="header-title">BLPT DIY</div>
        <div class="meta-text">UPJ Otomotif & AHASS</div>
        <div class="meta-text">Front Office Service Unit</div>
    </div>
    <div class="divider-double"></div>

    <!-- Meta Info -->
    <table style="font-size: 10px; margin-bottom: 4px;">
        <tr>
            <td width="35%">No. Nota</td>
            <td width="5%">:</td>
            <td width="60%">{{ $transaction->no_nota }}</td>
        </tr>
        <tr>
            <td>Tanggal</td>
            <td>:</td>
            <td>{{ \Carbon\Carbon::parse($transaction->tanggal)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td>Kasir</td>
            <td>:</td>
            <td>{{ $transaction->user->name ?? '-' }}</td>
        </tr>
        @if($transaction->services->count() > 0)
            <tr>
                <td>Mekanik</td>
                <td>:</td>
                <td>{{ $transaction->services->first()->mechanic->nama_mekanik ?? '-' }}</td>
            </tr>
        @endif
    </table>

    <div class="divider"></div>

    <!-- Details Header -->
    <table class="item-desc" style="font-size: 10px; margin-bottom: 4px;">
        <tr>
            <th width="30%">Qty</th>
            <th width="40%" class="text-right">Harga</th>
            <th width="30%" class="text-right">Total</th>
        </tr>
    </table>

    <!-- Services -->
    <div style="font-size: 10px;">
        @foreach($transaction->services as $svc)
            <div class="item-row">
                <span class="item-name">{{ $svc->nama_jasa }}</span>
                <table>
                    <tr>
                        <td width="30%">1</td>
                        <td width="40%" class="text-right">{{ number_format($svc->biaya_jasa, 0, ',', '.') }}</td>
                        <td width="30%" class="text-right">{{ number_format($svc->biaya_jasa, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </div>
        @endforeach

        <!-- Spare Parts -->
        @foreach($transaction->spareParts as $part)
            <div class="item-row">
                <span class="item-name">{{ $part->part->nama_suku_cadang ?? '-' }}</span>
                <table>
                    <tr>
                        <td width="30%">{{ $part->jumlah }}</td>
                        <td width="40%" class="text-right">{{ number_format($part->harga_satuan, 0, ',', '.') }}</td>
                        <td width="30%" class="text-right">{{ number_format($part->subtotal, 0, ',', '.') }}</td>
                    </tr>
                </table>
            </div>
        @endforeach
    </div>

    <div class="divider"></div>

    <!-- Summary -->
    <table style="font-size: 10px; margin-top: 4px;">
        <tr>
            <td width="60%">Subtotal (Jasa)</td>
            <td width="40%" class="text-right">Rp {{ number_format($transaction->total_biaya_jasa, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Subtotal (Parts)</td>
            <td class="text-right">Rp {{ number_format($transaction->total_biaya_parts, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Total</td>
            <td class="text-right">Rp {{ number_format($transaction->total_jasa_part, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="font-bold">Total Pembayaran</td>
            <td class="text-right font-bold">Rp {{ number_format($transaction->total_jasa_part, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td>Payment Method</td>
            <td class="text-right">Cash</td> <!-- Using hardcode since DB might not have method for now -->
        </tr>
    </table>

    <div class="divider"></div>

    <!-- Footer Section -->
    <div class="text-center meta-text" style="margin-top: 8px;">
        Terima Kasih Atas Kunjungan Anda<br>
        UPJ Otomotif & AHASS BLPT DIY
    </div>
    <div class="divider-double"></div>

</body>

</html>