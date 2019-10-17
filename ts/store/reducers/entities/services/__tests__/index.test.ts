// TODO: it has to be updated due to https://www.pivotaltracker.com/story/show/169013940

// It implies item 42, not having the corresponding serviceMetadata being loaded, is not included among the local sections
// Check what happen with items 41 and 42 beign someLoading and someError
import * as pot from "italia-ts-commons/lib/pot";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";
import {
  isLoadingServicesSelector,
  localServicesSectionsSelector,
  nationalServicesSectionsSelector,
  notSelectedServicesSectionsSelector,
  organizationsOfInterestSelector,
  ServicesState
} from "..";
import { DepartmentName } from "../../../../../../definitions/backend/DepartmentName";
import { OrganizationName } from "../../../../../../definitions/backend/OrganizationName";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../../../definitions/backend/ServiceName";
import { ServiceTuple } from "../../../../../../definitions/backend/ServiceTuple";
import { ScopeEnum } from "../../../../../../definitions/content/Service";
import { ServiceMetadataById } from "../../../content";
import { UserMetadataState } from "../../../userMetadata";
import { OrganizationsState } from "../../organizations";

const customPotUserMetadata: UserMetadataState = pot.some({
  version: 1,
  metadata: {
    experimentalFeatures: true,
    organizationsOfInterest: ["1", "2", "3", "4"]
  }
});

const customServices: ServicesState = {
  byId: {
    ["11"]: pot.noneError(Error()),
    ["21"]: pot.some({
      department_name: "test" as DepartmentName,
      organization_fiscal_code: "2" as OrganizationFiscalCode,
      organization_name: "organization2" as OrganizationName,
      service_id: "21" as ServiceId,
      service_name: "service1" as ServiceName,
      version: 1
    }),
    ["22"]: undefined,
    ["31"]: pot.someLoading({
      department_name: "test" as DepartmentName,
      organization_fiscal_code: "3" as OrganizationFiscalCode,
      organization_name: "organization3" as OrganizationName,
      service_id: "31" as ServiceId,
      service_name: "service1" as ServiceName,
      version: 1
    }),
    ["41"]: pot.someError(
      {
        department_name: "test" as DepartmentName,
        organization_fiscal_code: "4" as OrganizationFiscalCode,
        organization_name: "organization4" as OrganizationName,
        service_id: "41" as ServiceId,
        service_name: "service1" as ServiceName,
        version: 1
      },
      Error("Generic error")
    ),
    ["42"]: pot.someLoading({
      department_name: "test" as DepartmentName,
      organization_fiscal_code: "4" as OrganizationFiscalCode,
      organization_name: "organization4" as OrganizationName,
      service_id: "42" as ServiceId,
      service_name: "service1" as ServiceName,
      version: 1
    })
  },
  byOrgFiscalCode: {
    // tslint:disable-next-line: readonly-array
    ["2"]: ["21", "22"] as ServiceId[],
    // tslint:disable-next-line: readonly-array
    ["3"]: ["31"] as ServiceId[],
    // tslint:disable-next-line: readonly-array
    ["4"]: ["41", "42"] as ServiceId[]
  },
  visible: {
    kind: "PotSome",
    value: [
      { service_id: "11", version: 1 } as ServiceTuple,
      { service_id: "21", version: 1 } as ServiceTuple,
      { service_id: "22", version: 1 } as ServiceTuple,
      { service_id: "41", version: 1 } as ServiceTuple
    ]
  },
  readState: {
    ["21"]: true
  },
  firstLoading: {
    isFirstServicesLoadingCompleted: false
  }
};

const customOrganizations: OrganizationsState = {
  all: [
    {
      name: "organizzazion2",
      fiscalCode: "2"
    },
    {
      name: "organization3",
      fiscalCode: "3"
    },
    {
      name: "organization4",
      fiscalCode: "4"
    }
  ],
  nameByFiscalCode: {
    ["2" as OrganizationFiscalCode]: "organizzazion2" as NonEmptyString,
    ["3" as OrganizationFiscalCode]: "organizzazion3" as NonEmptyString,
    ["4" as OrganizationFiscalCode]: "organizzazion4" as NonEmptyString
  }
};

const customServicesMetadata: { byId: ServiceMetadataById } = {
  byId: {
    ["11"]: pot.none,
    ["21"]: pot.some({
      description: "Descrizione servizio",
      email: "info@test.it",
      phone: "800 000 000",
      privacy_url: "http://www.privacy.it",
      scope: ScopeEnum.LOCAL,
      tos_url: "http://www.tos.it",
      web_url: "https://weburl.it"
    }),
    ["22"]: pot.none,
    ["31"]: pot.noneError("Generic error"),
    ["41"]: pot.some({
      description: "Descrizione servizio",
      email: "info@test.it",
      phone: "800 000 000",
      privacy_url: "http://www.privacy.it",
      scope: ScopeEnum.LOCAL,
      tos_url: "http://www.tos.it",
      web_url: "https://weburl.it"
    }),
    ["42"]: pot.none
  }
};

describe("organizationsOfInterestSelector", () => {
  it("should include organizations in the user organizationsOfInterest and providing visible services among those properly loaded", () => {
    expect(
      organizationsOfInterestSelector.resultFunc(
        customPotUserMetadata,
        customServices
      )
    ).toStrictEqual(["2", "4"]);
  });
});

describe("isLoadingServicesSelector", () => {
  it("should do be true if visibleServices are loading", () => {
    expect(
      isLoadingServicesSelector.resultFunc(true, true, pot.toLoading(pot.none))
    ).toBe(true);
  });
});

describe("nationalServicesSectionsSelector", () => {
  it("should return the services having scope equal to NATIONAL", () => {
    expect(
      nationalServicesSectionsSelector.resultFunc(
        customServices,
        customOrganizations.nameByFiscalCode,
        customServicesMetadata
      )
    ).toStrictEqual([]);
  });
});

describe("localServicesSectionsSelector", () => {
  it("should return the services having metadata and scope equal to LOCAL", () => {
    expect(
      localServicesSectionsSelector.resultFunc(
        customServices,
        customOrganizations.nameByFiscalCode,
        customServicesMetadata
      )
    ).toStrictEqual([
      {
        organizationName: customOrganizations.nameByFiscalCode["2"] as string,
        organizationFiscalCode: "2" as OrganizationFiscalCode,
        data: [customServices.byId["21"]]
      },
      {
        organizationName: customOrganizations.nameByFiscalCode["4"] as string,
        organizationFiscalCode: "4" as OrganizationFiscalCode,
        data: [customServices.byId["41"]]
      }
    ]);
  });
});

describe("notSelectedServicesSectionsSelector", () => {
  it("should return all the visible services with scope equal to both NATIONAL and LOCAL if the user organizationsOfInterest is empty", () => {
    expect(
      notSelectedServicesSectionsSelector.resultFunc(
        customServices,
        customOrganizations.nameByFiscalCode,
        customServicesMetadata,
        [""]
      )
    ).toStrictEqual([
      {
        organizationName: customOrganizations.nameByFiscalCode["2"] as string,
        organizationFiscalCode: "2" as OrganizationFiscalCode,
        data: [customServices.byId["21"]]
      },
      {
        organizationName: customOrganizations.nameByFiscalCode["4"] as string,
        organizationFiscalCode: "4" as OrganizationFiscalCode,
        data: [customServices.byId["41"]]
      }
    ]);
  });
});
