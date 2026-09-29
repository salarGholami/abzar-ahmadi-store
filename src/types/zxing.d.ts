/**
 * Local ambient declarations for the ZXing packages used by
 * `src/app/dashboard/pos/page.tsx` (camera barcode scanning).
 *
 * Why this file exists: the installed `@zxing/browser` package does not
 * resolve its bundled type declarations under this project's
 * `"moduleResolution": "bundler"` setting, which TypeScript reports as
 * "implicitly has an 'any' type". Rather than suppress that with `any`
 * or a bare `declare module "@zxing/browser";`, this file declares the
 * exact surface we call, so the scanner stays fully type-safe.
 *
 * This file only satisfies the TYPE CHECKER. The actual packages still
 * have to be installed (`npm install @zxing/library @zxing/browser`) —
 * if they are missing from node_modules, the dynamic import() in
 * BarcodeScanner will still fail at runtime regardless of this file.
 */

declare module "@zxing/library" {
  export class Result {
    getText(): string;
    getBarcodeFormat(): BarcodeFormat;
    getTimestamp(): number;
  }

  export enum BarcodeFormat {
    AZTEC,
    CODABAR,
    CODE_39,
    CODE_93,
    CODE_128,
    DATA_MATRIX,
    EAN_8,
    EAN_13,
    ITF,
    MAXICODE,
    PDF_417,
    QR_CODE,
    RSS_14,
    RSS_EXPANDED,
    UPC_A,
    UPC_E,
    UPC_EAN_EXTENSION,
  }

  export enum DecodeHintType {
    OTHER,
    PURE_BARCODE,
    POSSIBLE_FORMATS,
    TRY_HARDER,
    CHARACTER_SET,
    ALLOWED_LENGTHS,
    ASSUME_CODE_39_CHECK_DIGIT,
    ASSUME_GS1,
    RETURN_CODABAR_START_END,
    NEED_RESULT_POINT_CALLBACK,
    ALLOWED_EAN_EXTENSIONS,
    ALSO_INVERTED,
  }
}

declare module "@zxing/browser" {
  import type { DecodeHintType, Result } from "@zxing/library";

  export interface IScannerControls {
    stop(): void;
    switchTorch?(onOff: boolean): Promise<void>;
  }

  export type DecodeContinuouslyCallback = (
    result: Result | undefined,
    error: unknown,
    controls: IScannerControls,
  ) => void;

  export class BrowserMultiFormatReader {
    constructor(hints?: Map<DecodeHintType, unknown>);

    decodeFromConstraints(
      constraints: MediaStreamConstraints,
      videoElement: HTMLVideoElement,
      callbackFn: DecodeContinuouslyCallback,
    ): Promise<IScannerControls>;
  }
}
