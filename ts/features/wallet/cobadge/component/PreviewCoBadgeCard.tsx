import * as React from "react";
import { PaymentInstrument } from "../../../../../definitions/pagopa/walletv2/PaymentInstrument";
import { Abi } from "../../../../../definitions/pagopa/walletv2/Abi";
import { getCardIconFromBrand } from "../../../../utils/card";
import {
  getTitleFromPaymentInstrument,
  isCoBadgeBlocked
} from "../../../../utils/paymentMethod";
import BaseCoBadgeCard from "./BaseCoBadgeCard";

type Props = { coBadge: PaymentInstrument; abi: Abi };

/**
 * Display a preview of a cobadge that the user could add to the wallet
 * @constructor
 */
const PreviewCoBadgeCard: React.FunctionComponent<Props> = props => {
  const brandLogo = getCardIconFromBrand(props.coBadge.brand);
  return (
    <BaseCoBadgeCard
      abi={props.abi}
      expiringDate={props.coBadge.expiringDate}
      blocked={isCoBadgeBlocked(props.coBadge)}
      brandLogo={brandLogo}
      caption={getTitleFromPaymentInstrument(props.coBadge)}
    />
  );
};
export default PreviewCoBadgeCard;
