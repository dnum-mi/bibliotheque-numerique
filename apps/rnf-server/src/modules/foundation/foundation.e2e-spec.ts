import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "@/app.module";
import { DsService } from "@/modules/ds/providers/ds.service";
import { dsServiceMock } from "@/test/mocks/ds-service.mock";
import { mainConfig } from "@/main.config";
import { LoggerService } from "@/shared/modules/logger/providers/logger.service";
import { loggerServiceMock } from "@/test/mocks/logger-service.mock";
import { PrismaService } from "@/shared/modules/prisma/providers/prisma.service";

describe("Foundation Controller (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DsService)
      .useValue(dsServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    mainConfig(app);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await prisma.foundation.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "Foundation_id_seq" RESTART WITH 1;`;
    await app.init();
  });

  it("POST /foundation - Should return 400 if no dossierId provided", () => {
    return request(app.getHttpServer())
      .post("/api/foundation")
      .expect(400)
      .expect({
        statusCode: 400,
        message:
          "Validation error(s):\n Champs dossierId: dossierId should not be null or undefined, dossierId must not be less than 0" +
          ", dossierId must be a number conforming to the specified constraints\n" +
          "Champs email: email should not be null or undefined, email must be an email",
        path: "/api/foundation",
      });
  });

  it("POST /foundation - Should return 424 if dossierId provided is wrong", () => {
    return request(app.getHttpServer())
      .post("/api/foundation")
      .send({
        dossierId: 42,
        email: "toto@gmail.com",
      })
      .expect(424)
      .expect({
        statusCode: 424,
        message: "GraphQL Error from DS-API.",
        path: "/api/foundation",
      });
  });

  it("POST /foundation - Should return 400 if dossierId has not the right demarche", () => {
    return request(app.getHttpServer())
      .post("/api/foundation")
      .send({
        dossierId: 37,
        email: "yoyo@gmail.com",
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: "This demarche id is not implemented",
        path: "/api/foundation",
      });
  });

  it("POST /foundation - Should return 403 if email provided is wrong", () => {
    return request(app.getHttpServer())
      .post("/api/foundation")
      .send({
        dossierId: 37,
        email: "fake@gmail.com",
      })
      .expect(403)
      .expect({
        statusCode: 403,
        message: "This instructeur's email is not linked to this dossier.",
        path: "/api/foundation",
      });
  });

  it("POST /foundation - Should create a new foundation with dotation", async () => {
    const result = await request(app.getHttpServer())
      .post("/api/foundation")
      .send({
        dossierId: 17,
        email: "toto@gmail.com",
      })
      .expect(201);
    expect(result.body).toEqual({
      rnfId: "033-FDD-000001-06",
    });
    await prisma.foundation.findFirst({ where: { rnfId: "033-FDD-000001-06" }, include: { address: true } }).then((a) => {
      expect(a).toMatchObject({
        id: 1,
        rnfId: "033-FDD-000001-06",
        type: "FDD",
        department: 33,
        title: "Héritage",
        addressId: 1,
        phone: "06 86 46 54 45",
        email: "tata@gmail.com",
        address: {
          id: 1,
          label: "11 Rue Pelleport 33800 Bordeaux",
          type: "housenumber",
          streetAddress: "11 Rue Pelleport",
          streetNumber: "11",
          streetName: "Rue Pelleport",
          postalCode: "33800",
          cityName: "Bordeaux",
          cityCode: "33063",
          departmentName: "Gironde",
          departmentCode: "33",
          regionName: "Nouvelle-Aquitaine",
          regionCode: "75",
        },
      });
    });
    return;
  });

  it("POST /foundation - Should create a new foundation with entreprise", async () => {
    const result = await request(app.getHttpServer())
      .post("/api/foundation")
      .send({
        dossierId: 65,
        email: "titi@gmail.com",
      })
      .expect(201);
    expect(result.body).toEqual({
      rnfId: "059-FE-000001-08",
    });
    await prisma.foundation.findFirst({ where: { rnfId: "059-FE-000001-08" }, include: { address: true } }).then((a) => {
      expect(a).toMatchObject({
        id: 1,
        rnfId: "059-FE-000001-08",
        type: "FE",
        department: 59,
        title: "Test demo",
        addressId: 2,
        phone: null,
        email: null,
        address: {
          id: 2,
          label: "1 Square Wannoschot 59800 Lille",
          type: "housenumber",
          streetAddress: "1 Square Wannoschot",
          streetNumber: "1",
          streetName: "Square Wannoschot",
          postalCode: "59800",
          cityName: "Lille",
          cityCode: "59350",
          departmentName: "Nord",
          departmentCode: "59",
          regionName: "Hauts-de-France",
          regionCode: "32",
        },
      });
    });
    return;
  });

  it("GET /foundation/rnf-id - Should return 400 for wrong rnf", async () => {
    return await request(app.getHttpServer()).get("/api/foundation/toto").expect(400).expect({
      statusCode: 400,
      message: "Validation error(s):\n Champs rnfId: Le numéro RNF n'est pas valide",
      path: "/api/foundation/toto",
    });
  });

  it("GET /foundation/rnf-id - Should return 404 for not existing rnf", async () => {
    return await request(app.getHttpServer()).get("/api/foundation/059-FE-000002-04").expect(404).expect({
      statusCode: 404,
      message: "No foundation found with this rnfId.",
      path: "/api/foundation/059-FE-000002-04",
    });
  });

  it("GET /foundation/rnf-id - Should return 200 with correct foundation", async () => {
    await prisma.foundation.create({
      data: {
        rnfId: "033-FDD-000001-06",
        type: "FDD",
        department: 33,
        title: "Héritage",
        phone: "06 86 46 54 45",
        email: "straydine.aiguadel-jaleme@interieur.gouv.fr",
        address: {
          create: {
            label: "11 Rue Pelleport 33800 Bordeaux",
            type: "housenumber",
            streetAddress: "11 Rue Pelleport",
            streetNumber: "11",
            streetName: "Rue Pelleport",
            postalCode: "33800",
            cityName: "Bordeaux",
            cityCode: "33063",
            departmentName: "Gironde",
            departmentCode: "33",
            regionName: "Nouvelle-Aquitaine",
            regionCode: "75",
          },
        },
      },
    });
    await prisma.foundation.create({
      data: {
        rnfId: "059-FE-000002-04",
        type: "FE",
        department: 59,
        title: "Test demo",
        phone: null,
        email: null,
        address: {
          create: {
            label: "1 Square Wannoschot 59800 Lille",
            type: "housenumber",
            streetAddress: "1 Square Wannoschot",
            streetNumber: "1",
            streetName: "Square Wannoschot",
            postalCode: "59800",
            cityName: "Lille",
            cityCode: "59350",
            departmentName: "Nord",
            departmentCode: "59",
            regionName: "Hauts-de-France",
            regionCode: "32",
          },
        },
      },
    });
    const result = await request(app.getHttpServer()).get("/api/foundation/033-FDD-000001-06").expect(200);
    expect(result.body).toMatchObject({
      id: 1,
      rnfId: "033-FDD-000001-06",
      type: "FDD",
      department: 33,
      title: "Héritage",
      phone: "06 86 46 54 45",
      email: "straydine.aiguadel-jaleme@interieur.gouv.fr",
      address: {
        label: "11 Rue Pelleport 33800 Bordeaux",
        type: "housenumber",
        streetAddress: "11 Rue Pelleport",
        streetNumber: "11",
        streetName: "Rue Pelleport",
        postalCode: "33800",
        cityName: "Bordeaux",
        cityCode: "33063",
        departmentName: "Gironde",
        departmentCode: "33",
        regionName: "Nouvelle-Aquitaine",
        regionCode: "75",
      },
    });
    const date = new Date(result.body.createdAt || "");
    const date2 = new Date(result.body.updatedAt || "");
    expect(date.getTime()).toEqual(date2.getTime());
    expect(date.getTime()).toBeCloseTo(new Date().getTime(), -3);
  });
});
