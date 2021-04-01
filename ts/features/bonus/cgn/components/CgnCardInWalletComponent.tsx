import { Millisecond } from "italia-ts-commons/lib/units";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ImageBackground, StyleSheet, Image, Platform } from "react-native";
import { View } from "native-base";
import { navigateToCgnDetails } from "../navigation/actions";
import { isCgnInformationAvailableSelector } from "../store/reducers/details";
import { cgnDetails } from "../store/actions/details";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { GlobalState } from "../../../../store/reducers/types";
import cgnBackground from "../../../../../img/bonus/cgn/cgn-preview.png";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../components/core/typography/H3";
import I18n from "../../../../i18n";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  preview: {
    marginBottom: -20,
    height: 88
  },
  imagePreview: {
    resizeMode: "stretch",
    height: 88,
    width: "100%"
  },
  paddedContentPreview: {
    paddingLeft: 18,
    paddingBottom: 10,
    paddingRight: 22
  },
  spaced: {
    justifyContent: "space-between"
  },
  previewLogo: {
    resizeMode: "contain",
    height: 40,
    width: 40
  },
  upperShadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 13,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 17,
    width: "100%"
  }
});

const CgnCardList = (props: Props) => (
  <>
    {props.isCgnActive && (
      <>
        {Platform.OS === "android" && <View style={styles.upperShadowBox} />}
        <ImageBackground
          source={cgnBackground}
          style={styles.preview}
          imageStyle={styles.imagePreview}
        >
          <TouchableDefaultOpacity
            onPress={props.navigateToCgnDetailScreen}
            style={[
              IOStyles.row,
              styles.spaced,
              styles.paddedContentPreview,
              { alignItems: "center" }
            ]}
          >
            <H3 color={"black"} weight={"Bold"}>
              {I18n.t("bonus.cgn.name")}
            </H3>
            <Image source={cgnLogo} style={styles.previewLogo} />
          </TouchableDefaultOpacity>
        </ImageBackground>
      </>
    )}
  </>
);

const CgnCardListMemo = React.memo(
  CgnCardList,
  (prev: Props, curr: Props) => prev.isCgnActive === curr.isCgnActive
);

// Automatically refresh when focused every 5 minutes
const refreshTime = 300000 as Millisecond;

/**
 * Render the cgn card in the wallet
 * @constructor
 */
const CgnCardInWalletContainer = (props: Props) => {
  // If the user does "pull to refresh", this timer is ignored and the refresh is forced
  useActionOnFocus(props.load, refreshTime);
  return <CgnCardListMemo {...props} />;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  load: () => dispatch(cgnDetails.request()),
  navigateToCgnDetailScreen: () => dispatch(navigateToCgnDetails())
});

const mapStateToProps = (state: GlobalState) => ({
  isCgnActive: isCgnInformationAvailableSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnCardInWalletContainer);
