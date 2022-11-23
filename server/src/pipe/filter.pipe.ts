import { Injectable, PipeTransform } from "@nestjs/common";
import {
  Equal,
  In,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from "typeorm";

@Injectable()
export class FilterPipe implements PipeTransform {
  private _checkAndChangeKey(value: object) {
    if (value.hasOwnProperty("$in")) {
      return In(value["$in"]);
    } else if (value.hasOwnProperty("$gt")) {
      return MoreThan(value["$gt"]);
    } else if (value.hasOwnProperty("$gte")) {
      return MoreThanOrEqual(value["$gte"]);
    } else if (value.hasOwnProperty("$lt")) {
      return LessThan(value["$lt"]);
    } else if (value.hasOwnProperty("$lte")) {
      return LessThanOrEqual(value["$lte"]);
    } else if (value.hasOwnProperty("$eq")) {
      return Equal(value["$eq"]);
    } else if (value.hasOwnProperty("$not")) {
      return Not(value["$not"]);
    } else {
      return this._parseObjectFilter(value);
    }
  }
  private _parseObjectFilter(value: object) {
    for (const v of Object.keys(value)) {
      if (typeof value[v] === "object" && !Array.isArray(value[v])) {
        value[v] = this._checkAndChangeKey(value[v]);
      }
    }
    return value;
  }

  transform(value: any) {
    if (typeof value === "object") {
      this._parseObjectFilter(value);
    }
    console.log(value);
    return value;
  }
}
