import { Tab, TabHeading, Tabs, Text, View } from "native-base";
import * as React from "react";
import { Animated, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";
import MessagesArchive from "../../components/messages/MessagesArchive";
import MessagesDeadlines from "../../components/messages/MessagesDeadlines";
import MessagesInbox from "../../components/messages/MessagesInbox";
import MessagesSearch from "../../components/messages/MessagesSearch";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { SearchType } from "../../components/search/SearchButton";
import { SearchEmptyText } from "../../components/search/SearchEmptyText";
import I18n from "../../i18n";
import {
  loadMessages,
  setMessagesArchivedState
} from "../../store/actions/messages";
import { navigateToMessageDetailScreenAction } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { lexicallyOrderedMessagesStateSelector } from "../../store/reducers/entities/messages";
import { paymentsByRptIdSelector } from "../../store/reducers/entities/payments";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import {
  isSearchMessagesEnabledSelector,
  searchTextSelector
} from "../../store/reducers/search";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

type Props = NavigationScreenProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  currentTab: number;
};

// Scroll range is directly influenced by floating header height
const SCROLL_RANGE_FOR_ANIMATION = 72;

const styles = StyleSheet.create({
  tabBarContainer: {
    elevation: 0,
    height: 40
  },
  tabBarContent: {
    fontSize: customVariables.fontSizeSmall
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.tabUnderlineColor,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  tabBarUnderlineActive: {
    height: customVariables.tabUnderlineHeight,
    // borders do not overlap eachother, but stack naturally
    marginBottom: -customVariables.tabUnderlineHeight,
    backgroundColor: customVariables.contentPrimaryBackground
  },
  shadowContainer: {
    backgroundColor: "#FFFFFF"
  },
  shadow: {
    width: "100%",
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.brandGray,
    // iOS shadow
    shadowColor: customVariables.footerShadowColor,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 5,
    shadowOpacity: 1,
    // Android shadow
    elevation: 5,
    marginTop: -1
  },
  searchDisableIcon: {
    color: customVariables.headerFontColor
  }
});

const AnimatedTabs = Animated.createAnimatedComponent(Tabs);
/**
 * A screen that contains all the Tabs related to messages.
 */
class MessagesHomeScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  public animatedScrollPositions: ReadonlyArray<Animated.Value> = [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ];

  public componentDidMount() {
    this.props.refreshMessages();
  }

  private renderShadow = () => (
    <View style={styles.shadowContainer}>
      <View style={styles.shadow} />
    </View>
  );

  public render() {
    const { isSearchEnabled } = this.props;
    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        isSearchAvailable={true}
        searchType={SearchType.Messages}
        appLogo={true}
      >
        {!isSearchEnabled && (
          <React.Fragment>
            <ScreenContentHeader
              title={I18n.t("messages.contentTitle")}
              icon={require("../../../img/icons/message-icon.png")}
              fixed={true}
            />
            {this.renderTabs()}
          </React.Fragment>
        )}
        {isSearchEnabled && this.renderSearch()}
      </TopScreenComponent>
    );
  }

  /**
   * Render Inbox, Deadlines and Archive tabs.
   */
  private renderTabs = () => {
    const {
      isExperimentalFeaturesEnabled,
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail,
      updateMessagesArchivedState
    } = this.props;

    return (
      <AnimatedTabs
        tabContainerStyle={[styles.tabBarContainer, styles.tabBarUnderline]}
        tabBarUnderlineStyle={styles.tabBarUnderlineActive}
        onChangeTab={(evt: any) => {
          this.setState({ currentTab: evt.i });
        }}
        initialPage={0}
        style={{
          transform: [
            {
              translateY: this.animatedScrollPositions[
                this.state.currentTab
              ].interpolate({
                inputRange: [
                  0,
                  SCROLL_RANGE_FOR_ANIMATION / 2,
                  SCROLL_RANGE_FOR_ANIMATION
                ],
                outputRange: [
                  SCROLL_RANGE_FOR_ANIMATION,
                  SCROLL_RANGE_FOR_ANIMATION / 4,
                  0
                ],
                extrapolate: "clamp"
              })
            }
          ]
        }}
      >
        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("messages.tab.inbox")}
              </Text>
            </TabHeading>
          }
        >
          {this.renderShadow()}
          <MessagesInbox
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
            animated={{
              onScroll: Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: this.animatedScrollPositions[0]
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              ),
              scrollEventThrottle: 8 // target is 120fps
            }}
            paddingForAnimation={true}
            AnimatedCTAStyle={{
              transform: [
                {
                  translateY: this.animatedScrollPositions[
                    this.state.currentTab
                  ].interpolate({
                    inputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION / 2,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    outputRange: [
                      0,

                      SCROLL_RANGE_FOR_ANIMATION * 0.75,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    extrapolate: "clamp"
                  })
                }
              ]
            }}
          />
        </Tab>
        {isExperimentalFeaturesEnabled && (
          <Tab
            heading={
              <TabHeading>
                <Text style={styles.tabBarContent}>
                  {I18n.t("messages.tab.deadlines")}
                </Text>
              </TabHeading>
            }
          >
            {this.renderShadow()}
            <MessagesDeadlines
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              setMessagesArchivedState={updateMessagesArchivedState}
              navigateToMessageDetail={navigateToMessageDetail}
            />
          </Tab>
        )}

        <Tab
          heading={
            <TabHeading>
              <Text style={styles.tabBarContent}>
                {I18n.t("messages.tab.archive")}
              </Text>
            </TabHeading>
          }
        >
          {this.renderShadow()}
          <MessagesArchive
            messagesState={lexicallyOrderedMessagesState}
            servicesById={servicesById}
            paymentsByRptId={paymentsByRptId}
            onRefresh={refreshMessages}
            setMessagesArchivedState={updateMessagesArchivedState}
            navigateToMessageDetail={navigateToMessageDetail}
            animated={{
              onScroll: Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: {
                        y: isExperimentalFeaturesEnabled
                          ? this.animatedScrollPositions[2]
                          : this.animatedScrollPositions[1]
                      }
                    }
                  }
                ],
                { useNativeDriver: true }
              ),
              scrollEventThrottle: 8 // target is 120fps
            }}
            paddingForAnimation={true}
            AnimatedCTAStyle={{
              transform: [
                {
                  translateY: this.animatedScrollPositions[
                    this.state.currentTab
                  ].interpolate({
                    inputRange: [
                      0,
                      SCROLL_RANGE_FOR_ANIMATION / 2,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    outputRange: [
                      0,

                      SCROLL_RANGE_FOR_ANIMATION * 0.75,
                      SCROLL_RANGE_FOR_ANIMATION
                    ],
                    extrapolate: "clamp"
                  })
                }
              ]
            }}
          />
        </Tab>
      </AnimatedTabs>
    );
  };

  /**
   * Render MessageSearch component.
   */
  private renderSearch = () => {
    const {
      lexicallyOrderedMessagesState,
      servicesById,
      paymentsByRptId,
      refreshMessages,
      navigateToMessageDetail
    } = this.props;

    return this.props.searchText
      .map(
        _ =>
          _.length < 3 ? (
            <SearchEmptyText />
          ) : (
            <MessagesSearch
              messagesState={lexicallyOrderedMessagesState}
              servicesById={servicesById}
              paymentsByRptId={paymentsByRptId}
              onRefresh={refreshMessages}
              navigateToMessageDetail={navigateToMessageDetail}
              searchText={_}
            />
          )
      )
      .getOrElse(<SearchEmptyText />);
  };
}

const mapStateToProps = (state: GlobalState) => ({
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled,
  lexicallyOrderedMessagesState: lexicallyOrderedMessagesStateSelector(state),
  servicesById: servicesByIdSelector(state),
  paymentsByRptId: paymentsByRptIdSelector(state),
  searchText: searchTextSelector(state),
  isSearchEnabled: isSearchMessagesEnabledSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  refreshMessages: () => {
    dispatch(loadMessages.request());
  },
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  updateMessagesArchivedState: (
    ids: ReadonlyArray<string>,
    archived: boolean
  ) => dispatch(setMessagesArchivedState(ids, archived))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MessagesHomeScreen);
