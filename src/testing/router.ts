import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { convertToParamMap, ParamMap } from '@angular/router';

export { Router, ActivatedRoute } from '@angular/router';
export { RouterTestingModule } from '@angular/router/testing';

@Injectable()
export class ActivatedRouteStub {
  private queryParamSubject = new BehaviorSubject(
    convertToParamMap(this.testQueryParamMap)
  );
  queryParamMap = this.queryParamSubject.asObservable();

  private paramSubject = new BehaviorSubject(
    convertToParamMap(this.testParamMap)
  );
  paramMap = this.paramSubject.asObservable();

  private dataSubject = new BehaviorSubject(null);
  data = this.dataSubject.asObservable();

  private _testParamMap: ParamMap;
  get testParamMap() {
    return this._testParamMap;
  }
  set testParamMap(params: {}) {
    this._testParamMap = convertToParamMap(params);
    this.paramSubject.next(this._testParamMap);
  }

  private _testQueryParamMap: ParamMap;
  get testQueryParamMap() {
    return this._testQueryParamMap;
  }
  set testQueryParamMap(params: {}) {
    this._testQueryParamMap = convertToParamMap(params);
    this.queryParamSubject.next(this._testQueryParamMap);
  }

  get snapshot() {
    return {
      paramMap: this.testParamMap,
      queryParamMap: this.testQueryParamMap
    };
  }

  private _testData;
  get testData() {
    return this._testData;
  }
  set testData(data) {
    this._testData = data;
    this.dataSubject.next(data);
  }
}
