<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quote {{ $quote->quote_number }}</title>
    <style>
        /*
         * DomPDF-safe layout rules:
         *  - @page sets actual page margins — never pad a width:100% div
         *  - All multi-column layout uses <table>, never floats or flex
         *  - No box-sizing (DomPDF ignores it)
         *  - No overflow:hidden on block elements
         *  - word-wrap:break-word (better DomPDF support than word-break)
         *  - Totals: 2-cell wrapper table instead of float:right
         */

        @page {
            margin-top: 0;
            margin-bottom: 0;
            margin-left: 0;
            margin-right: 0;
            size: A4 portrait;
        }

        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 10pt;
            color: #111111;
            margin: 0;
            padding: 0;
        }

        /* ─────────────────────────────────────────
           HEADER
        ───────────────────────────────────────── */
        .header-wrap {
            background-color: #E6EDFA;
            padding: 24pt 40pt 18pt 40pt;
        }

        .logo-center {
            text-align: center;
            padding-bottom: 12pt;
        }

        .logo-center img {
            height: 50pt;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }

        .meta-table td {
            vertical-align: top;
            line-height: 1.6;
            padding: 0 0 10pt 0;
        }

        .meta-right {
            text-align: right;
        }

        .quote-number {
            text-align: center;
            font-size: 22pt;
            font-weight: bold;
            color: #1a3a8f;
            padding-top: 4pt;
            letter-spacing: 0.5pt;
        }

        /* ─────────────────────────────────────────
           CONTENT AREA — padded via inner table cell
        ───────────────────────────────────────── */
        .page-body {
            padding: 22pt 40pt 0 40pt;
        }

        /* Customer / Project Overview */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16pt;
        }

        .info-table td {
            vertical-align: top;
            padding: 0;
            line-height: 1.65;
            font-size: 9.5pt;
        }

        .info-table td.left-col {
            padding-right: 14pt;
        }

        .section-heading {
            font-weight: bold;
            font-size: 8pt;
            text-transform: uppercase;
            color: #4169E1;
            padding-bottom: 4pt;
        }

        /* ─────────────────────────────────────────
           ITEMS TABLE
        ───────────────────────────────────────── */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 14pt;
        }

        .items-table th {
            background-color: #4169E1;
            color: #ffffff;
            font-size: 8.5pt;
            font-weight: bold;
            padding: 7pt 7pt;
            text-align: left;
        }

        .items-table th.c { text-align: center; }
        .items-table th.r { text-align: right; }

        .items-table td {
            background-color: #EEF2FB;
            font-size: 9pt;
            padding: 9pt 7pt;
            vertical-align: top;
            border-bottom: 2pt solid #ffffff;
            word-wrap: break-word;
        }

        .items-table td.c {
            text-align: center;
            vertical-align: middle;
        }

        .items-table td.r {
            text-align: right;
            vertical-align: middle;
            white-space: nowrap;
        }

        .req-list {
            margin: 5pt 0 0 0;
            padding-left: 13pt;
            font-size: 8.5pt;
        }

        .req-list li {
            margin-bottom: 3pt;
            word-wrap: break-word;
        }

        /* ─────────────────────────────────────────
           TOTALS — 2-cell wrapper: spacer | amounts
           No floats — DomPDF doesn't support them reliably
        ───────────────────────────────────────── */
        .totals-wrap {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18pt;
        }

        .totals-inner {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-inner td {
            font-size: 9.5pt;
            padding: 3pt 0;
            line-height: 1.6;
        }

        .tl {
            font-weight: bold;
            text-align: left;
            padding-right: 18pt;
        }

        .tr {
            font-weight: bold;
            text-align: right;
            white-space: nowrap;
        }

        .grand td {
            border-top: 1.5pt solid #4169E1;
            padding-top: 5pt;
            color: #4169E1;
            font-size: 10pt;
        }

        /* ─────────────────────────────────────────
           TERMS
        ───────────────────────────────────────── */
        .terms-wrap {
            padding: 0 40pt;
        }

        .terms-box {
            border-top: 1pt solid #aaaaaa;
            padding-top: 9pt;
            margin-top: 18pt;
            font-size: 8pt;
            text-align: center;
            color: #444444;
            line-height: 1.55;
        }

        /* ─────────────────────────────────────────
           SIGNATURE
        ───────────────────────────────────────── */
        .sig-wrap {
            padding: 0 40pt;
        }

        .sig-intro {
            text-align: center;
            font-size: 9pt;
            margin-top: 28pt;
            margin-bottom: 28pt;
        }

        .sig-table {
            width: 100%;
            border-collapse: collapse;
        }

        .sig-table td {
            vertical-align: top;
            text-align: center;
            font-size: 9pt;
        }

        .sig-line {
            border-top: 1pt solid #000000;
            padding-top: 6pt;
        }

        /* ─────────────────────────────────────────
           FOOTER — full-width background, fixed-layout table
        ───────────────────────────────────────── */
        .footer-wrap {
            background-color: #E6EDFA;
            padding: 14pt 40pt;
            margin-top: 22pt;
        }

        .footer-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .footer-table td {
            vertical-align: middle;
            padding: 0;
        }

        .footer-logo img {
            height: 36pt;
        }

        .footer-addr {
            text-align: right;
            font-size: 8pt;
            line-height: 1.7;
            color: #222222;
            word-wrap: break-word;
        }
    </style>
</head>
<body>

{{-- ══════ HEADER ══════ --}}
<div class="header-wrap">

    <div class="logo-center">
        <img src="{{ public_path('vilcomsignature.png') }}" alt="Vilcom Networks">
    </div>

    <table class="meta-table">
        <tr>
            <td width="55%">
                <strong>Date:</strong> {{ $quote->quoted_at ? $quote->quoted_at->format('d/m/Y') : now()->format('d/m/Y') }}<br>
                <strong>Valid Until:</strong> {{ $quote->quote_valid_until ? $quote->quote_valid_until->format('d/m/Y') : now()->addDays(30)->format('d/m/Y') }}
            </td>
            <td width="45%" class="meta-right">
                <strong>Email:</strong> {{ $quote->contact_email }}
            </td>
        </tr>
    </table>

    <div class="quote-number">#{{ $quote->quote_number }}</div>

</div>


{{-- ══════ MAIN CONTENT ══════ --}}
<div class="page-body">

    {{-- Customer / Project Overview --}}
    <table class="info-table">
        <tr>
            <td width="44%" class="left-col">
                <div class="section-heading">Customer</div>
                <strong>{{ $quote->contact_name }}</strong><br>
                {{ $quote->company_name ?? 'N/A' }}<br>
                {{ $quote->contact_email }}
            </td>
            <td width="56%">
                <div class="section-heading">Project Overview</div>
                <strong>Service Provisioning:</strong> {{ $quote->getServiceTypeLabel() }}.<br>
                @if($quote->admin_response || $quote->staff_notes)
                    {!! nl2br(e($quote->admin_response ?? $quote->staff_notes)) !!}
                @endif
            </td>
        </tr>
    </table>

    {{-- Items --}}
    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="c" width="6%">Qty</th>
                <th class="c" width="15%">Product ID</th>
                <th class="r" width="18%">Unit Price</th>
                <th class="r" width="18%">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $quote->getServiceTypeLabel() }} – Installation &amp; Setup</strong>

                    @if($quote->general_info || $quote->technical_requirements)
                        <ul class="req-list">
                            @if($quote->general_info && is_array($quote->general_info))
                                @foreach($quote->general_info as $key => $value)
                                    <li>
                                        <strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong>
                                        {{ is_string($value) ? $value : json_encode($value) }}
                                    </li>
                                @endforeach
                            @endif
                            @if($quote->technical_requirements && is_array($quote->technical_requirements))
                                @foreach($quote->technical_requirements as $key => $value)
                                    <li>
                                        <strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong>
                                        {{ is_string($value) ? $value : json_encode($value) }}
                                    </li>
                                @endforeach
                            @endif
                        </ul>
                    @endif
                </td>
                <td class="c">1</td>
                <td class="c">{{ $quote->product_id ?? 'N/A' }}</td>
                <td class="r">{{ $quote->getFormattedPriceAttribute() }}</td>
                <td class="r">{{ $quote->getFormattedPriceAttribute() }}</td>
            </tr>
        </tbody>
    </table>

    {{--
        TOTALS
        Left cell = empty spacer so totals sit on the right.
        Right cell is fixed at 200pt so it never overflows.
    --}}
    <table class="totals-wrap">
        <tr>
            <td>&nbsp;</td>
            <td width="200pt" style="vertical-align: top; padding: 0;">
                <table class="totals-inner">
                    <tr>
                        <td class="tl">Subtotal</td>
                        <td class="tr">{{ $quote->getFormattedPriceAttribute() }}</td>
                    </tr>
                    <tr>
                        <td class="tl">VAT</td>
                        <td class="tr">Included</td>
                    </tr>
                    <tr>
                        <td class="tl">Other Charges</td>
                        <td class="tr">—</td>
                    </tr>
                    <tr class="grand">
                        <td class="tl">Grand Total</td>
                        <td class="tr">{{ $quote->getFormattedPriceAttribute() }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

</div>{{-- /page-body --}}


{{-- ══════ TERMS ══════ --}}
<div class="terms-wrap">
    <div class="terms-box">
        <em><strong>Terms &amp; Conditions:</strong>
        This document is not an invoice and is only an estimate of goods/services described above.
        Payment is due prior to the provision or delivery of goods/services.
        This quotation is valid until the date indicated above.</em>
    </div>
</div>


{{-- ══════ SIGNATURE ══════ --}}
<div class="sig-wrap">
    <p class="sig-intro">Please confirm your acceptance of this quotation by signing below:</p>
    <table class="sig-table">
        <tr>
            <td width="44%" class="sig-line">Signature over printed name</td>
            <td width="12%">&nbsp;</td>
            <td width="44%" class="sig-line">Date signed</td>
        </tr>
    </table>
</div>


{{-- ══════ FOOTER ══════ --}}
<div class="footer-wrap">
    <table class="footer-table">
        <tr>
            <td width="50%" class="footer-logo">
                <img src="{{ public_path('vilcomsignature.png') }}" alt="Vilcom Networks">
            </td>
            <td width="50%" class="footer-addr">
                Ramco Court, Block B, Mombasa Road, Nairobi<br>
                0111 028800<br>
                customercare@vilcom.co.ke
            </td>
        </tr>
    </table>
</div>

</body>
</html>
