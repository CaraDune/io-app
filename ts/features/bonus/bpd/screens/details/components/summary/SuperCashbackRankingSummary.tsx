import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H2 } from "../../../../../../../components/core/typography/H2";
import { H5 } from "../../../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../../../components/core/variables/IOColors";
import IconFont from "../../../../../../../components/ui/IconFont";
import I18n from "../../../../../../../i18n";
import { configSelector } from "../../../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { formatIntegerNumber } from "../../../../../../../utils/stringBuilder";
import {
  BpdPeriodWithInfo,
  BpdRanking,
  BpdRankingReady,
  isBpdRankingReady
} from "../../../../store/reducers/details/periods";
import { BpdBaseShadowBoxLayout } from "./base/BpdBaseShadowBoxLayout";

const loadLocales = () => ({
  title: I18n.t("bonus.bpd.details.components.ranking.title"),
  of: I18n.t("bonus.bpd.details.components.transactionsCountOverview.of"),
  wip: I18n.t("profile.preferences.list.wip")
});

const styles = StyleSheet.create({
  title: {
    textAlign: "center"
  },
  center: { alignSelf: "center" }
});

type OwnProps = {
  period: BpdPeriodWithInfo;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const SuperCashbackRankingReady = (props: {
  ranking: number;
  minRanking: number;
}): React.ReactElement => {
  const { title, of } = loadLocales();
  return (
    <BpdBaseShadowBoxLayout
      row1={
        <H5 testID={"supercashbackSummary.title"} style={styles.title}>
          {title}
        </H5>
      }
      row2={
        <H2
          testID={"supercashbackSummary.ranking"}
          color={"blue"}
          style={styles.title}
        >
          {formatIntegerNumber(props.ranking)}°
        </H2>
      }
      row3={
        <H5
          testID={"supercashbackSummary.minRanking"}
          color={"bluegrey"}
          style={styles.title}
        >
          {of} {formatIntegerNumber(props.minRanking)}
        </H5>
      }
    />
  );
};

const SuperCashbackRankingNotReady = (): React.ReactElement => {
  const { title, wip } = loadLocales();
  return (
    <BpdBaseShadowBoxLayout
      row1={
        <H5 testID={"supercashbackSummary.title"} style={styles.title}>
          {title}
        </H5>
      }
      row2={
        <>
          <View spacer={true} xsmall={true} />
          <IconFont
            name={"io-hourglass"}
            size={24}
            color={IOColors.blue as string}
            style={styles.center}
          />
          <View spacer={true} xsmall={true} />
        </>
      }
      row3={
        <H5
          testID={"supercashbackSummary.minRanking"}
          color={"bluegrey"}
          style={styles.title}
        >
          {wip}
        </H5>
      }
    />
  );
};

/**
 * The ranking should be visible only when the remoteRanking is enabled && isBpdRankingReady
 * @param ranking
 * @param remoteEnabled
 */
const shouldDisplayRanking = (
  ranking: BpdRanking,
  remoteEnabled: boolean | undefined
): ranking is BpdRankingReady =>
  remoteEnabled ? isBpdRankingReady(ranking) : false;

/**
 * Choose the right super cashback ranking representation:
 * 1) The ranking is ready: SuperCashbackRankingReady
 * 2) The ranking is not ready: TBD
 * TODO: the cashback ranking should also be remotely activable
 * @param props
 * @constructor
 */
const SuperCashbackRankingSummary = (props: Props): React.ReactElement =>
  shouldDisplayRanking(props.period.ranking, props.rankingRemoteEnabled) ? (
    <SuperCashbackRankingReady
      ranking={props.period.ranking.ranking}
      minRanking={props.period.minPosition}
    />
  ) : (
    <SuperCashbackRankingNotReady />
  );

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  rankingRemoteEnabled: configSelector("bpd_ranking")(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SuperCashbackRankingSummary);
