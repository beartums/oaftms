declare @districtId int = 1404,
		@deliveryNamePartial varchar(100) = 'LR2017%'

select * from countries for json path, ROOT('Countries')
select * from districts where districtId%1000 = @districtId%1000 for json path, ROOT('Districts')
select * from Regions for json path, ROOT('Regions')
select * from sectors where districtId = @districtId for json path, ROOT('Sectors')
select DistrictID, DropID, DropName, Active from drops where districtId = @districtId for json path, ROOT('Drops')
select ddial.* from DeliveryDropInputAuditLogs ddial
	Join Deliveries d
	on d.DistrictID = ddial.DistrictID
	and d.DeliveryID = ddial.DeliveryID
	where ddial.DeliveryStage like 'field%' and ddial.districtid=@districtId and d.DeliveryName like @deliveryNamePartial
	for json path, ROOT('DeliveryDropInputAuditLogs')

select * from deliveries where DistrictID = @districtId and DeliveryName like @deliveryNamePartial for json path, ROOT('Deliveries')

select * from creditCycles where DistrictID = @districtId for json path, ROOT('CreditCycles')

select * from seasons where DistrictID = @districtId for json path, ROOT('Seasons')

select i.* from inputs i
	join DeliveryInputs di
	on i.InputID = di.InputID
	join Deliveries d
	on d.DistrictID = di.DistrictID
	and d.DeliveryID = di.DeliveryID
	where d.DistrictID = @districtId and DeliveryName like @deliveryNamePartial for json path, ROOT('Inputs')

select da.* from DropAssignments da
	join Deliveries d
	on da.DeliveryID = d.DeliveryID
	and da.DistrictID = d.DistrictID
	where d.DistrictID = @districtId and DeliveryName like @deliveryNamePartial for json path, ROOT('DropAssignments')
	select sis.* from SeasonInputSizes sis
	join deliveries d
	on sis.DistrictID = d.DistrictID
	and sis.DeliveryID = d.DeliveryID
	where d.DistrictID = @districtId and DeliveryName like @deliveryNamePartial for json path, ROOT('SeasonInputSizes')
